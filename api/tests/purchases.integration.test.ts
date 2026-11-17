import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Purchase } from "../src/models/compra.model.js";

// Only touches rows created by this test. Run after migrate:purchases.
test(
  "purchases persist atomically, reconcile stock, reject stale writes and preserve legacy inventory",
  {
    skip: process.env.RUN_DB_TESTS !== "1",
  },
  async () => {
    const { default: pool } = await import("../src/config/database.js");
    const { default: plants } = await import("../src/models/planta.model.js");
    const { default: app } = await import("../src/app.js");
    const { createAuthToken } = await import("../src/utils/auth-token.js");
    const server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
    const { token } = createAuthToken({ id: 1, user: "purchases-test" });
    const headers = {
      cookie: `auth_token=${token}`,
      "Content-Type": "application/json",
    };
    const ids: number[] = [];
    let plantId: number | undefined;
    const request = (path: string, method = "GET", body?: unknown) =>
      fetch(base + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    try {
      for (const [method, path] of [
        ["GET", "/compras"],
        ["POST", "/compras"],
        ["GET", "/compras/1"],
        ["PATCH", "/compras/1"],
        ["POST", "/compras/1/anular"],
      ]) {
        assert.equal((await fetch(base + path, { method })).status, 401);
      }
      const plant = await plants.create({
        nombre: `Compras test ${randomUUID()}`,
        precio: 100,
        stock: 4,
      });
      plantId = plant.id;
      const input = {
        fecha: "2026-10-22",
        proveedor: `Proveedor ${randomUUID()}`,
        observaciones: "Reposición de prueba",
        total: 0,
        items: [
          {
            descripcion: "Potus",
            tipo: "planta",
            plantaId: plantId,
            cantidad: 2,
            precioUnitario: 0.1,
          },
          {
            descripcion: "Potus segunda línea",
            tipo: "planta",
            plantaId: plantId,
            cantidad: 3,
            precioUnitario: 1200,
          },
          {
            descripcion: "Maceta",
            tipo: "maceta",
            plantaId: null,
            cantidad: 2,
            precioUnitario: 400,
          },
        ],
      };
      const created = await request("/compras", "POST", input);
      assert.equal(created.status, 201, await created.clone().text());
      let purchase = (await created.json()) as Purchase;
      ids.push(purchase.id);
      assert.equal(purchase.total, 4400.2, "server ignores supplied total");
      assert.equal(purchase.items.length, 3);
      assert.equal(purchase.stockAplicado, true);
      assert.equal((await plants.findById(plantId))?.stock, 9);
      assert.equal((await request(`/compras/${purchase.id}`)).status, 200);
      const listed = (await (
        await request("/compras?desde=2026-10-01&hasta=2026-10-31")
      ).json()) as Purchase[];
      assert.ok(
        listed.some(
          (row) => row.id === purchase.id && row.fecha === input.fecha,
        ),
      );
      assert.equal(
        (await request("/compras?desde=2026-12-01&hasta=2026-10-01")).status,
        400,
      );
      assert.equal((await request("/compras?desde=2026-02-30")).status, 400);

      const changed = {
        ...input,
        version: purchase.version,
        items: [{ ...input.items[0], cantidad: 8 }],
      };
      const concurrent = await Promise.all([
        request(`/compras/${purchase.id}`, "PATCH", changed),
        request(`/compras/${purchase.id}`, "PATCH", changed),
      ]);
      assert.deepEqual(
        concurrent.map((response) => response.status).sort(),
        [200, 409],
      );
      purchase = (await concurrent
        .find((response) => response.status === 200)!
        .json()) as Purchase;
      assert.equal(
        (await plants.findById(plantId))?.stock,
        12,
        "edit applies only the difference once",
      );
      assert.equal(purchase.total, 0.8);

      await pool.execute("UPDATE plantas SET stock = 1 WHERE id = ?", [
        plantId,
      ]);
      assert.equal(
        (
          await request(`/compras/${purchase.id}/anular`, "POST", {
            version: purchase.version,
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await request(`/compras/${purchase.id}`, "PATCH", {
            ...changed,
            version: purchase.version,
            items: [{ ...input.items[0], cantidad: 1 }],
          })
        ).status,
        409,
      );
      const unchanged = (await (
        await request(`/compras/${purchase.id}`)
      ).json()) as Purchase;
      assert.equal(unchanged.total, 0.8);
      assert.equal(unchanged.version, purchase.version);
      assert.equal(unchanged.anulada, false);
      assert.equal((await plants.findById(plantId))?.stock, 1);

      await pool.execute("UPDATE plantas SET stock = 12 WHERE id = ?", [
        plantId,
      ]);
      const annulled = await request(`/compras/${purchase.id}/anular`, "POST", {
        version: purchase.version,
      });
      assert.equal(annulled.status, 200, await annulled.clone().text());
      purchase = (await annulled.json()) as Purchase;
      assert.equal(purchase.anulada, true);
      assert.equal(
        purchase.total,
        0.8,
        "annulment keeps historical amounts and items",
      );
      assert.equal(purchase.items.length, 1);
      assert.equal((await plants.findById(plantId))?.stock, 4);
      assert.equal(
        (
          await request(`/compras/${purchase.id}/anular`, "POST", {
            version: purchase.version,
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await request(`/compras/${purchase.id}`, "PATCH", {
            ...changed,
            version: purchase.version,
          })
        ).status,
        409,
      );
      assert.equal((await plants.findById(plantId))?.stock, 4);

      const [legacy] = await pool.execute<ResultSetHeader>(
        "INSERT INTO compras (fecha, proveedor, total) VALUES (?, ?, ?)",
        [input.fecha, input.proveedor, 100],
      );
      ids.push(legacy.insertId);
      const legacyEdit = await request(`/compras/${legacy.insertId}`, "PATCH", {
        ...changed,
        version: 1,
      });
      assert.equal(legacyEdit.status, 200, await legacyEdit.clone().text());
      const legacyPurchase = (await legacyEdit.json()) as Purchase;
      assert.equal(legacyPurchase.stockAplicado, false);
      assert.equal((await plants.findById(plantId))?.stock, 4);
      assert.equal(
        (
          await request(`/compras/${legacy.insertId}/anular`, "POST", {
            version: legacyPurchase.version,
          })
        ).status,
        200,
      );
      assert.equal((await plants.findById(plantId))?.stock, 4);

      const [counts] = await pool.execute<RowDataPacket[]>(
        "SELECT COUNT(*) AS count FROM compras WHERE proveedor = ?",
        [input.proveedor],
      );
      assert.equal(
        (
          await request("/compras", "POST", {
            ...input,
            items: [
              input.items[0],
              { ...input.items[0], plantaId: 2_147_483_647 },
            ],
          })
        ).status,
        400,
      );
      const [afterCounts] = await pool.execute<RowDataPacket[]>(
        "SELECT COUNT(*) AS count FROM compras WHERE proveedor = ?",
        [input.proveedor],
      );
      assert.equal(
        afterCounts[0].count,
        counts[0].count,
        "failed purchase leaves no partial rows",
      );
      assert.equal(
        (await plants.findById(plantId))?.stock,
        4,
        "a later invalid line rolls back earlier stock changes",
      );
    } finally {
      for (const id of ids) {
        await pool.execute("DELETE FROM compras_detalle WHERE compra_id = ?", [
          id,
        ]);
        await pool.execute("DELETE FROM compras WHERE id = ?", [id]);
      }
      if (plantId) await plants.delete(plantId);
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await pool.end();
    }
  },
);
