import type {
  Order,
  OrdersByStatus,
  OrderStatus,
} from "../../contexts/OrdersContext";

export const statusIds: OrderStatus[] = [
  "pending",
  "ready",
  "shipped",
  "confirmed",
  "canceled",
];

export function moveOrder(
  orders: OrdersByStatus,
  order: Order,
  status: OrderStatus,
  index: number,
): OrdersByStatus {
  const next = { ...orders };
  for (const id of statusIds) {
    next[id] = orders[id].filter((item) => item.id !== order.id);
  }
  next[status].splice(index, 0, order);
  return next;
}

// Refresh order data without discarding the positions chosen on the board.
export function syncOrders(current: OrdersByStatus, incoming: OrdersByStatus) {
  const next = { ...incoming };
  for (const status of statusIds) {
    const remaining = new Map(incoming[status].map((order) => [order.id, order]));
    next[status] = [];
    for (const order of current[status]) {
      const updated = remaining.get(order.id);
      if (updated) {
        next[status].push(updated);
        remaining.delete(order.id);
      }
    }
    next[status].push(...remaining.values());
  }
  return next;
}
