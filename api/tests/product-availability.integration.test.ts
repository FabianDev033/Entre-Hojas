import assert from "node:assert/strict";
import { test } from "node:test";
import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import type { RowDataPacket } from "mysql2";

test("availability persists without changing stock and checkout rejects disabled products atomically", {
  skip: process.env.RUN_DB_TESTS !== "1",
}, async () => {
  const { default: pool } = await import("../src/config/database.js");
  const { default: plants } = await import("../src/models/planta.model.js");
  const { default: app } = await import("../src/app.js");
  const { createAuthToken } = await import("../src/utils/auth-token.js");
  const { token } = createAuthToken({ id: 1, user: "availability-test" });
  const headers = { cookie: `auth_token=${token}` };
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const ids: number[] = [];
  const customerName = `Disponibilidad ${randomUUID()}`;
  const input = {
    nombre: `Prueba disponibilidad ${randomUUID()}`, familia: "Potus", precio: 100, discount: 0,
    etiqueta: "", etiquetas: [], origen: null, tipo: null, iluminacion: null, resistencia: null,
    tamano: null, cuidado: null, descripcion: null, imagenesEliminadas: [],
  };
  const edit = async (id: number, changes: object) => {
    const body = new FormData();
    body.append("datos", JSON.stringify({ ...input, ...changes }));
    return fetch(`${base}/api/productos/${id}/edicion`, { method: "PATCH", headers, body });
  };
  const checkout = (items: { plantId: number; quantity: number }[]) => fetch(`${base}/api/ordenes/checkout`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ items, customer: { nombre: customerName, direccion: "Prueba", latitude: -33.3, longitude: -66.3 }, paymentMethod: "efectivo" }),
  });
  try {
    const body = new FormData();
    body.append("datos", JSON.stringify({ ...input, stock: 8, habilitado: false }));
    let response = await fetch(`${base}/api/productos`, { method: "POST", headers, body });
    assert.equal(response.status, 201, await response.clone().text());
    const created = await response.json() as { id: number; habilitado: boolean; stock: number };
    ids.push(created.id);
    assert.equal(created.habilitado, false);
    assert.equal(created.stock, 8);
    const enabled = await plants.create({ nombre: `Habilitada ${randomUUID()}`, precio: 100, stock: 4 });
    ids.push(enabled.id);
    assert.equal(enabled.habilitado, true);

    response = await edit(created.id, {});
    assert.equal(response.status, 200);
    assert.equal((await response.json()).habilitado, false, "older editors preserve the disabled state");
    for (const habilitado of [true, false]) {
      response = await edit(created.id, { habilitado });
      assert.equal(response.status, 200, await response.clone().text());
      const saved = await response.json();
      assert.equal(saved.habilitado, habilitado);
      assert.equal(saved.stock, 8);
      assert.equal(saved.ventas, 0);
      assert.equal((await plants.findEditById(created.id))?.habilitado, habilitado);
      const catalog = await (await fetch(`${base}/api/plantas/familia/AllPlants`)).json() as { id: number; habilitado: boolean; stock: number }[];
      assert.equal(catalog.find((plant) => plant.id === created.id)?.habilitado, habilitado);
      assert.equal(catalog.find((plant) => plant.id === created.id)?.stock, 8);
      assert.equal((await plants.findAllInventory()).find((plant) => plant.id === created.id)?.habilitado, habilitado);
    }
    for (const habilitado of [null, "false", 0]) {
      response = await fetch(`${base}/api/plantas/${created.id}`, {
        method: "PATCH", headers: { ...headers, "content-type": "application/json" }, body: JSON.stringify({ habilitado }),
      });
      assert.equal(response.status, 400);
      assert.equal((await plants.findById(created.id))?.habilitado, false);
    }
    response = await checkout([{ plantId: enabled.id, quantity: 1 }, { plantId: created.id, quantity: 1 }]);
    assert.equal(response.status, 409);
    assert.match((await response.json()).error, /sin stock/);
    assert.equal((await plants.findById(created.id))?.stock, 8);
    assert.equal((await plants.findById(enabled.id))?.stock, 4, "a mixed rejected order does not consume available stock");
    const [customers] = await pool.execute<RowDataPacket[]>("SELECT id FROM clientes WHERE nombre = ?", [customerName]);
    assert.equal(customers.length, 0, "rejection creates no customer or order");

    assert.equal((await edit(created.id, { habilitado: true })).status, 200);
    response = await checkout([{ plantId: created.id, quantity: 1 }]);
    assert.equal(response.status, 201, await response.clone().text());
    assert.equal((await plants.findById(created.id))?.stock, 7, "reenabling restores checkout");
    await plants.update(created.id, { stock: 0 });
    response = await checkout([{ plantId: created.id, quantity: 1 }]);
    assert.equal(response.status, 409, "an enabled product with zero units cannot be purchased");
  } finally {
    await pool.execute("DELETE d FROM orden_detalle d JOIN ordenes o ON o.id = d.ordenes_id JOIN clientes c ON c.id = o.clientes_id WHERE c.nombre = ?", [customerName]);
    await pool.execute("DELETE o FROM ordenes o JOIN clientes c ON c.id = o.clientes_id WHERE c.nombre = ?", [customerName]);
    await pool.execute("DELETE FROM clientes WHERE nombre = ?", [customerName]);
    for (const id of ids) await plants.delete(id);
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await pool.end();
  }
});
