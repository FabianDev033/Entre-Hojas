import {
  DragDropProvider,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/react";
import { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

import { Column, Item } from "../../Components/orders";
import {
  moveOrder,
  statusIds,
  syncOrders,
} from "../../Components/orders/orderBoard";
import { Search } from "../../assets/icons";
import {
  useOrders,
  type OrderStatus,
  type OrdersByStatus,
} from "../../contexts/OrdersContext";

const findOrderStatus = (
  orders: OrdersByStatus,
  orderId: number,
): OrderStatus | null => {
  return (
    (Object.keys(orders) as OrderStatus[]).find((status) =>
      orders[status].some((order) => order.id === orderId),
    ) ?? null
  );
};

const getDraggedOrderId = (id: string | number | undefined) => {
  const value = String(id ?? "").replace("search-", "");
  const orderId = Number(value);
  return Number.isInteger(orderId) ? orderId : null;
};

export default function Orders() {
  const { allOrders, orders, isLoading, error, updateOrderStatus } =
    useOrders();
  const isSavingRef = useRef(false);
  const [search, setSearch] = useState("");
  const [isSearchDrag, setIsSearchDrag] = useState(false);
  const [ordersDnd, setOrdersDnd] = useState(orders);
  const [syncedOrders, setSyncedOrders] = useState(orders);
  const beforeDrag = useRef(orders);

  if (orders !== syncedOrders) {
    setSyncedOrders(orders);
    setOrdersDnd(syncOrders(ordersDnd, orders));
  }

  const searchResults = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return [];

    return allOrders.filter(
      (order) =>
        String(order.id).includes(query) ||
        order.cliente.nombre.toLocaleLowerCase().includes(query),
    );
  }, [allOrders, search]);

  if (isLoading) {
    return (
      <main className="min-h-svh bg-bg-dark p-6 font-Manrope">
        Cargando órdenes...
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-svh bg-bg-dark p-6 font-Manrope text-red-700">
        {error}
      </main>
    );
  }

  const handleDragOver = (event: DragOverEvent) => {
    // React owns the preview too, so the DOM and the saved position agree.
    event.preventDefault();
    const { source, target } = event.operation;
    if (!source || !target) return;
    const orderId = getDraggedOrderId(source.id);
    const targetOrderId = getDraggedOrderId(target.id);
    const order = allOrders.find((item) => item.id === orderId);
    const nextStatus = statusIds.includes(target.id as OrderStatus)
      ? (target.id as OrderStatus)
      : targetOrderId === null
        ? null
        : findOrderStatus(ordersDnd, targetOrderId);
    if (!order || !nextStatus || orderId === targetOrderId) return;

    const destination = ordersDnd[nextStatus];
    const targetIndex = destination.findIndex(
      (item) => item.id === targetOrderId,
    );
    const currentIndex = destination.findIndex((item) => item.id === orderId);
    const y = event.operation.shape?.current.center.y;
    const below =
      y !== undefined && target.shape ? y > target.shape.center.y : false;
    let index = targetIndex;
    if (targetIndex === -1) {
      // Use the cards, not the column's midpoint, for gaps and empty space.
      const cards = Array.from(target.element?.children ?? []).filter(
        (card) => card.getAttribute("data-order-id") !== String(orderId),
      );
      index = cards.findIndex((card) => {
        const rect = card.getBoundingClientRect();
        return y !== undefined && y < rect.top + rect.height / 2;
      });
      if (index === -1) index = cards.length;
    } else if (currentIndex === -1 && below) {
      index += 1;
    }
    if (currentIndex === index) return;
    setOrdersDnd(moveOrder(ordersDnd, order, nextStatus, index));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const previousOrders = beforeDrag.current;
    if (event.canceled || !event.operation.target) {
      setOrdersDnd(previousOrders);
      return;
    }

    const orderId = getDraggedOrderId(event.operation.source?.id);
    const nextStatus =
      orderId === null ? null : findOrderStatus(ordersDnd, orderId);
    if (!orderId || !nextStatus) return;
    const previousStatus = findOrderStatus(previousOrders, orderId);
    if (isSearchDrag) setSearch("");

    if (previousStatus === nextStatus) {
      return;
    }

    isSavingRef.current = true;
    try {
      await updateOrderStatus(orderId, nextStatus);
    } catch {
      setOrdersDnd(previousOrders);
      toast.error(
        "No se pudo actualizar la orden. Se restauró su estado anterior.",
      );
    } finally {
      isSavingRef.current = false;
    }
  };

  return (
    <main className="h-svh w-full bg-bg-dark flex flex-col gap-5 items-center overflow-hidden">
      <DragDropProvider
        onBeforeDragStart={(event) => {
          if (isSavingRef.current) event.preventDefault();
        }}
        onDragStart={(event) => {
          beforeDrag.current = ordersDnd;
          setIsSearchDrag(
            String(event.operation.source?.id).startsWith("search-"),
          );
        }}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}>
        <DragOverlay
          className="fixed"
          dropAnimation={isSearchDrag ? null : undefined}>
          {(source) => (
            <Item
              id={source.id}
              index={0}
              order={allOrders.find(
                (order) => order.id === getDraggedOrderId(source.id),
              )}
              column="search">
              Orden
            </Item>
          )}
        </DragOverlay>
        <div className="relative z-10 justify-self-center flex items-center py-2 px-4 bg-bg-light rounded-sm shadow-md mr-60 mb-5 border border-alt-dark">
          <input
            className="text-sm font-Manrope focus:outline-none"
            placeholder="Buscar ordenes"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="w-11/12 h-full bg-transparent flex justify-center items-center rounded-r-md">
            <Search className="w-6 h-6 text-black" />
          </div>

          {search.trim() && (
            <div className="absolute top-full left-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-sm border border-alt-dark bg-bg-light p-2 shadow-md">
              {searchResults.length > 0 ? (
                searchResults.map((order, index) => (
                  <Item
                    key={`search-${order.id}`}
                    id={`search-${order.id}`}
                    index={index}
                    order={order}
                    column="search">
                    Orden #{order.id}
                  </Item>
                ))
              ) : (
                <p className="p-2 text-sm font-Manrope">
                  No encontramos órdenes.
                </p>
              )}
            </div>
          )}
        </div>

        <section className="grid grid-cols-4 grid-rows-2 gap-3 w-full max-h-svh h-svh font-Outfit text-lg text-black">
          <div className="row-span-2 flex flex-col items-center max-h-[85vh] min-h-[85vh]">
            <span className="text-3xl">En proceso</span>

            <Column id="pending">
              {ordersDnd.pending.map((order) => (
                <Item
                  key={order.id}
                  id={order.id}
                  index={ordersDnd.pending.indexOf(order)}
                  order={order}
                  column="pending">
                  Orden #{order.id}
                </Item>
              ))}
            </Column>
          </div>

          <div className="row-span-2 flex flex-col items-center relative max-h-[85vh] min-h-[85vh] after:content-[''] after:absolute after:h-[95%] after:border-l after:border-black after:-left-2">
            <span className="text-3xl">Listo para envio</span>

            <Column id="ready">
              {ordersDnd.ready.map((order) => (
                <Item
                  key={order.id}
                  id={order.id}
                  index={ordersDnd.ready.indexOf(order)}
                  order={order}
                  column="ready">
                  Orden #{order.id}
                </Item>
              ))}
            </Column>
          </div>

          <div className="row-span-2 flex flex-col items-center relative max-h-[85vh] min-h-[85vh] after:content-[''] after:absolute after:h-[95%] after:border-l after:border-black after:-left-2 before:absolute before:h-[95%] before:border-l before:border-black before:-right-2">
            <span className="text-3xl">Enviado</span>

            <Column id="shipped">
              {ordersDnd.shipped.map((order) => (
                <Item
                  key={order.id}
                  id={order.id}
                  index={ordersDnd.shipped.indexOf(order)}
                  order={order}
                  column="shipped">
                  Orden #{order.id}
                </Item>
              ))}
            </Column>
          </div>

          <div className="max-h-[40vh] min-h-[40vh] flex flex-col items-center relative after:content-[''] after:absolute after:w-11/12 after:border-t after:border-black after:-bottom-2">
            <span className="text-3xl">Confirmado</span>

            <Column id="confirmed">
              {ordersDnd.confirmed.map((order) => (
                <Item
                  key={order.id}
                  id={order.id}
                  index={ordersDnd.confirmed.indexOf(order)}
                  order={order}
                  column="confirmed">
                  Orden #{order.id}
                </Item>
              ))}
            </Column>
          </div>

          <div className="col-start-4 row-start-2 flex flex-col items-center max-h-[40vh] min-h-[40vh]">
            <span className="text-3xl">Cancelado</span>

            <Column id="canceled">
              {ordersDnd.canceled.map((order) => (
                <Item
                  key={order.id}
                  id={order.id}
                  index={ordersDnd.canceled.indexOf(order)}
                  order={order}
                  column="canceled">
                  Orden #{order.id}
                </Item>
              ))}
            </Column>
          </div>
        </section>
      </DragDropProvider>
    </main>
  );
}
