import assert from "node:assert/strict";
import { test } from "node:test";
import {
  parsePurchaseDate,
  parsePurchaseInput,
  parsePurchaseVersion,
  purchaseStock,
  purchaseTotal,
} from "../src/utils/purchase-input.js";

const input = {
  fecha: "2026-10-22",
  proveedor: " Vivero de prueba ",
  observaciones: " Reposición ",
  items: [
    {
      descripcion: " Potus ",
      tipo: "planta",
      plantaId: 7,
      cantidad: 3,
      precioUnitario: 0.1,
    },
  ],
};

test("purchase totals use cents and aggregate repeated plants for inventory", () => {
  const parsed = parsePurchaseInput({ ...input, total: 999 });
  assert.equal(parsed.proveedor, "Vivero de prueba");
  assert.equal(parsed.items[0].descripcion, "Potus");
  assert.equal(purchaseTotal(parsed.items), 0.3);
  assert.equal(purchaseTotal([...parsed.items, ...parsed.items]), 0.6);
  assert.deepEqual(
    [...purchaseStock([...parsed.items, ...parsed.items])],
    [[7, 6]],
  );
});

test("invalid dates, money, quantities and inventory links are rejected", () => {
  assert.equal(parsePurchaseDate("2024-02-29"), "2024-02-29");
  for (const fecha of [
    "2026-02-29",
    "2026-04-31",
    "22/10/2026",
    "0000-01-01",
    null,
  ])
    assert.throws(() => parsePurchaseDate(fecha));
  for (const cantidad of [0, -1, 1.5, "2", 2_147_483_648, NaN])
    assert.throws(() =>
      parsePurchaseInput({
        ...input,
        items: [{ ...input.items[0], cantidad }],
      }),
    );
  for (const precioUnitario of [-1, "100", 1.001, Infinity, NaN, 100_000_000])
    assert.throws(() =>
      parsePurchaseInput({
        ...input,
        items: [{ ...input.items[0], precioUnitario }],
      }),
    );
  for (const patch of [
    { tipo: "no-existe" },
    { plantaId: null },
    { plantaId: "7" },
    { tipo: "maceta" },
    { descripcion: " " },
  ])
    assert.throws(() =>
      parsePurchaseInput({
        ...input,
        items: [{ ...input.items[0], ...patch }],
      }),
    );
  assert.throws(() => parsePurchaseInput({ ...input, items: [] }));
  assert.throws(() =>
    parsePurchaseInput({ ...input, items: Array(101).fill(input.items[0]) }),
  );
  assert.throws(() =>
    parsePurchaseInput({
      ...input,
      items: [{ ...input.items[0], cantidad: 2, precioUnitario: 99_999_999 }],
    }),
  );
  assert.throws(() => parsePurchaseInput({ ...input, proveedor: " " }));
  assert.throws(() => parsePurchaseVersion("1"));
  assert.equal(
    parsePurchaseInput({
      ...input,
      items: [
        {
          ...input.items[0],
          tipo: "maceta",
          plantaId: null,
          precioUnitario: 0,
        },
      ],
    }).items[0].plantaId,
    null,
  );
});
