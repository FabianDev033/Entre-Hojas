import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, readdir, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import type { PlantaEdicion } from "../src/models/planta.model.js";

// Opt in with RUN_DB_TESTS=1. Only creates and deletes its own temporary plants.
test("product editor persists changes, protects stock and rolls back invalid image changes", {
  skip: process.env.RUN_DB_TESTS !== "1",
}, async () => {
  const { default: pool } = await import("../src/config/database.js");
  const { default: plants } = await import("../src/models/planta.model.js");
  const { default: images } = await import("../src/models/imagen.model.js");
  const { default: app } = await import("../src/app.js");
  const { createAuthToken } = await import("../src/utils/auth-token.js");
  const { uploadsDirectory } = await import("../src/config/uploads.js");
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const { token } = createAuthToken({ id: 1, user: "product-edit-test" });
  const headers = { cookie: `auth_token=${token}` };
  const createdIds: number[] = [];
  const createdUrls: string[] = [];
  const input = {
    nombre: `Prueba ${randomUUID()}`, precio: 1234.56, discount: 10, etiqueta: "oferta", etiquetas: ["oferta"],
    familia: "Potus", origen: "Asia", tipo: "Interior", iluminacion: "Mucha",
    resistencia: "Mucha", tamano: "Mediano", cuidado: "Fácil", descripcion: "Descripción de prueba",
    imagenesEliminadas: [] as number[],
  };
  const photo = await readFile(new URL("../../client/src/assets/images/potus/PotusVariegado.webp", import.meta.url));
  const upload = async (id: number, data: object, files: Blob[] = []) => {
    const body = new FormData();
    body.append("datos", JSON.stringify(data));
    files.forEach((file, index) => body.append("imagenes", file, `photo-${index}.webp`));
    return fetch(`${baseUrl}/api/productos/${id}/edicion`, { method: "PATCH", headers, body });
  };

  try {
    const first = await plants.create({ nombre: input.nombre, precio: 500, stock: 7, etiqueta: "top" });
    createdIds.push(first.id);
    assert.deepEqual((await plants.findEditById(first.id))?.etiquetas, ["top"], "existing single labels remain assigned");
    assert.deepEqual((await plants.findByFamily("AllPlants")).find((plant) => plant.id === first.id)?.labels, ["top"]);
    const other = await plants.create({ nombre: `Otra ${randomUUID()}`, precio: 100, stock: 3 });
    createdIds.push(other.id);
    const original = await images.create({ plantas_id: first.id, url: "PotusVariegado", tipo: "detail" });
    const foreign = await images.create({ plantas_id: other.id, url: "PotusComun", tipo: "detail" });

    let response = await upload(first.id, input, [new Blob([photo], { type: "image/webp" })]);
    assert.equal(response.status, 200, await response.clone().text());
    const saved = await response.json() as PlantaEdicion;
    assert.equal(saved.stock, 7);
    assert.equal(saved.ventas, 0);
    assert.equal(saved.precio, 1234.56);
    assert.equal(saved.descripcion, input.descripcion);
    assert.equal(saved.tamano, input.tamano);
    assert.equal(saved.iluminacion, input.iluminacion);
    assert.equal(saved.resistencia, input.resistencia);
    assert.equal(saved.cuidado, input.cuidado);
    assert.equal(saved.imagenes.length, 2);
    const added = saved.imagenes.find((image) => image.id !== original.id)!;
    createdUrls.push(added.url);
    assert.ok(added.url.length <= 50, "uploaded paths fit the existing database column");
    response = await fetch(baseUrl + added.url);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/webp");
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), photo);

    response = await fetch(`${baseUrl}/api/plantas/${first.id}`);
    assert.equal((await response.json() as PlantaEdicion).imagenes.length, 2);
    for (const etiqueta of ["promo", "oferta", "ultimo", "top", "nuevo", "volvio", "elegido", "limitada", "regalo"]) {
      response = await upload(first.id, { ...input, etiqueta, etiquetas: [etiqueta] });
      assert.equal(response.status, 200);
      assert.equal((await response.json() as PlantaEdicion).etiqueta, etiqueta);
    }
    response = await upload(first.id, { ...input, etiquetas: ["oferta", "nuevo", "regalo"], etiqueta: "nuevo" });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json() as PlantaEdicion).etiquetas, ["oferta", "nuevo", "regalo"]);
    response = await fetch(`${baseUrl}/api/productos/${first.id}/edicion`, { headers });
    const reloaded = await response.json() as PlantaEdicion;
    assert.deepEqual(reloaded.etiquetas, ["oferta", "nuevo", "regalo"]);
    assert.equal(reloaded.etiqueta, "nuevo");
    response = await fetch(`${baseUrl}/api/plantas/familia/AllPlants`);
    const catalog = await response.json() as Array<{ id: number; label: string; labels: string[] }>;
    const card = catalog.find((plant) => plant.id === first.id)!;
    assert.equal(card.label, "nuevo", "storefront receives only the chosen display label");
    assert.ok(card.labels.includes("oferta"), "offer filtering uses all assigned labels");
    response = await upload(first.id, { ...input, etiquetas: ["oferta"], etiqueta: "nuevo" });
    assert.equal(response.status, 400);
    assert.equal((await plants.findEditById(first.id))?.etiqueta, "nuevo");
    const filesBefore = await readdir(uploadsDirectory);
    response = await upload(first.id, { ...input, nombre: "No debe guardarse", imagenesEliminadas: [foreign.id] }, [new Blob([photo], { type: "image/webp" })]);
    assert.equal(response.status, 400);
    assert.equal((await plants.findById(first.id))?.nombre, input.nombre);
    assert.deepEqual(await readdir(uploadsDirectory), filesBefore, "failed saves remove newly uploaded files");
    assert.ok(await images.findById(foreign.id));

    response = await upload(first.id, { ...input, stock: 999 });
    assert.equal(response.status, 400);
    response = await upload(first.id, input, [new Blob(["not an image"], { type: "image/webp" })]);
    assert.equal(response.status, 400);
    response = await upload(first.id, input, [new Blob([photo], { type: "text/plain" })]);
    assert.equal(response.status, 400);
    response = await upload(first.id, input, [new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: "image/png" })]);
    assert.equal(response.status, 400);
    assert.equal((await plants.findById(first.id))?.stock, 7);

    response = await upload(first.id, { ...input, imagenesEliminadas: [original.id, added.id] });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json() as PlantaEdicion).imagenes, []);
    assert.equal((await fetch(baseUrl + added.url)).status, 404);
    response = await upload(first.id, { ...input, etiquetas: [], etiqueta: "" });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json() as PlantaEdicion).etiquetas, []);
    assert.equal((await plants.findByFamily("AllPlants")).find((plant) => plant.id === first.id)?.label, "");
  } finally {
    for (const id of createdIds) {
      const remaining = await plants.findDetailById(id);
      createdUrls.push(...(remaining?.imagenes.map((image) => image.url) ?? []));
      await pool.execute("DELETE FROM imagenes WHERE plantas_id = ?", [id]);
      await plants.delete(id);
    }
    for (const url of createdUrls) {
      if (/^\/uploads\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(url)) {
        await unlink(join(uploadsDirectory, url.slice("/uploads/".length))).catch(() => {});
      }
    }
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await pool.end();
  }
});
