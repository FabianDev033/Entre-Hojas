import assert from "node:assert/strict";
import { test } from "node:test";
import { moveOrder, syncOrders } from "../src/Components/orders/orderBoard.ts";
import type { Order, OrdersByStatus } from "../src/contexts/OrdersContext.tsx";

const order = (id: number) => ({ id, cliente: { nombre: `Cliente ${id}` } }) as Order;
const board = (): OrdersByStatus => ({
  pending: [order(1), order(2)],
  ready: [order(3), order(4), order(5)],
  shipped: [],
  confirmed: [],
  canceled: [],
});
const ids = (orders: Order[]) => orders.map(({ id }) => id);

test("inserts at the top, middle and bottom without changing the original board", () => {
  for (const index of [0, 1, 3]) {
    const original = board();
    const next = moveOrder(original, original.pending[0], "ready", index);
    assert.equal(next.ready[index].id, 1);
    assert.deepEqual(ids(next.pending), [2]);
    assert.deepEqual(ids(original.pending), [1, 2]);
    assert.deepEqual(ids(original.ready), [3, 4, 5]);
  }
});

test("reorders within a column in both directions", () => {
  const original = board();
  const down = moveOrder(original, original.ready[0], "ready", 2);
  assert.deepEqual(ids(down.ready), [4, 5, 3]);
  const up = moveOrder(down, down.ready[2], "ready", 0);
  assert.deepEqual(ids(up.ready), [3, 4, 5]);
});

test("search moves an existing order once and restores an archived order into an empty column", () => {
  const next = moveOrder(board(), order(1), "ready", 1);
  assert.equal(Object.values(next).flat().filter(({ id }) => id === 1).length, 1);
  const restored = moveOrder(next, order(10), "confirmed", 0);
  assert.deepEqual(ids(restored.confirmed), [10]);
});

test("server confirmation refreshes data and preserves the chosen positions", () => {
  const local = moveOrder(board(), order(1), "ready", 1);
  const incoming = board();
  incoming.pending = [order(2)];
  incoming.ready = [{ ...order(1), estado: "listo" }, ...incoming.ready];
  const synced = syncOrders(local, incoming);
  assert.deepEqual(ids(synced.ready), [3, 1, 4, 5]);
  assert.equal(synced.ready[1].estado, "listo");
});

test("sync also respects newly loaded orders, removals and external status changes", () => {
  const incoming = board();
  incoming.pending = [order(2), order(6)];
  incoming.shipped = [order(1)];
  incoming.ready = [order(5), order(3)];
  const synced = syncOrders(board(), incoming);
  assert.deepEqual(ids(synced.pending), [2, 6]);
  assert.deepEqual(ids(synced.shipped), [1]);
  assert.deepEqual(ids(synced.ready), [3, 5]);
});
