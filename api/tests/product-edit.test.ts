import assert from "node:assert/strict";
import { test } from "node:test";
import { parsePlantEdit } from "../src/utils/plant-edit.js";

const validInput = {
  nombre: "Potus", familia: "Potus", precio: 7000, discount: 0, etiqueta: "", etiquetas: [],
  origen: null, tipo: null, iluminacion: null, resistencia: null, tamano: null,
  cuidado: null, descripcion: null, imagenesEliminadas: [],
};

test("editing accepts all nine labels, preserves text and normalizes empty fields", () => {
  for (const etiqueta of ["", "promo", "oferta", "ultimo", "top", "nuevo", "volvio", "elegido", "limitada", "regalo"]) {
    const { data } = parsePlantEdit({ ...validInput, etiqueta, etiquetas: etiqueta ? [etiqueta] : [], discount: 10, nombre: "  Potus  ", familia: " " });
    assert.equal(data.etiqueta, etiqueta || null);
    assert.equal(data.nombre, "Potus");
    assert.equal(data.familia, null);
  }
});

test("stock, sales and unknown fields cannot be submitted through the editor", () => {
  for (const field of ["stock", "ventas", "id", "actualizado"]) {
    assert.throws(() => parsePlantEdit({ ...validInput, [field]: 999 }));
  }
});

test("plant attributes accept only the defined choices and normalize case and accents", () => {
  const { data } = parsePlantEdit({ ...validInput, tamano: "pequeño", iluminacion: "media", resistencia: "mucha", cuidado: "facil" });
  assert.equal(data.tamano, "Pequeño");
  assert.equal(data.iluminacion, "Media");
  assert.equal(data.resistencia, "Mucha");
  assert.equal(data.cuidado, "Fácil");
  for (const [field, value] of [["tamano", "Enorme"], ["iluminacion", "Indirecta"], ["resistencia", "Alta"], ["cuidado", "Riego moderado"]]) {
    assert.throws(() => parsePlantEdit({ ...validInput, [field]: value }));
  }
});

test("invalid prices, discounts, labels and image IDs are rejected", () => {
  for (const precio of [-1, NaN, Infinity, 100_000_000, 10.123, "7000", null]) {
    assert.throws(() => parsePlantEdit({ ...validInput, precio }));
  }
  for (const discount of [-1, 101, 1.5, "10", null]) {
    assert.throws(() => parsePlantEdit({ ...validInput, discount }));
  }
  assert.throws(() => parsePlantEdit({ ...validInput, etiqueta: "oferta", etiquetas: ["oferta"] }));
  assert.throws(() => parsePlantEdit({ ...validInput, etiqueta: "incorrecta" }));
  assert.throws(() => parsePlantEdit({ ...validInput, nombre: " " }));
  assert.throws(() => parsePlantEdit({ ...validInput, familia: "x".repeat(101) }));
  assert.throws(() => parsePlantEdit({ ...validInput, imagenesEliminadas: ["1"] }));
  assert.throws(() => parsePlantEdit({ ...validInput, imagenesEliminadas: [-1] }));
  assert.deepEqual(parsePlantEdit({ ...validInput, imagenesEliminadas: [1, 1, 2] }).removedImageIds, [1, 2]);
});

test("multiple labels require a single assigned label for display", () => {
  const { data } = parsePlantEdit({ ...validInput, etiquetas: ["nuevo", "regalo", "nuevo"], etiqueta: "regalo" });
  assert.deepEqual(data.etiquetas, ["nuevo", "regalo"]);
  assert.equal(data.etiqueta, "regalo");
  assert.throws(() => parsePlantEdit({ ...validInput, etiquetas: ["nuevo"], etiqueta: "top" }));
  assert.throws(() => parsePlantEdit({ ...validInput, etiquetas: ["nuevo"], etiqueta: "" }));
  assert.throws(() => parsePlantEdit({ ...validInput, etiquetas: [], etiqueta: "nuevo" }));
  assert.throws(() => parsePlantEdit({ ...validInput, etiquetas: ["no-existe"] }));
  assert.throws(() => parsePlantEdit({ ...validInput, etiquetas: "nuevo" }));
  assert.throws(() => parsePlantEdit({ ...validInput, etiquetas: [null] }));
  assert.throws(() => parsePlantEdit({ ...validInput, etiquetas: ["nuevo", "oferta"], etiqueta: "nuevo", discount: 0 }));
  assert.doesNotThrow(() => parsePlantEdit({ ...validInput, etiquetas: ["nuevo", "oferta"], etiqueta: "nuevo", discount: 10 }));
});
