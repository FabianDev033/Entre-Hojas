import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { Column, Item } from "../Components/orders";
import { Search } from "../assets/icons";
import {
  useOrders,
  type OrderStatus,
  type OrdersByStatus,
} from "../contexts/OrdersContext";

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

export default function Orders() {
  const { orders, isLoading, error, updateOrderStatus } = useOrders();
  const isSavingRef = useRef(false);
  const [ordersDnd, setOrdersDnd] = useState<OrdersByStatus>({
    pending: [],
    ready: [],
    shipped: [],
    confirmed: [],
    canceled: [],
  });

  useEffect(() => {
    if (!isLoading) {
      setOrdersDnd(orders);
    }
  }, [orders, isLoading]);

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

  const handleDragEnd = async (event: DragEndEvent) => {
    if (event.canceled || !event.operation.target || isSavingRef.current) {
      return;
    }

    const orderId = Number(event.operation.source?.id);
    if (!Number.isInteger(orderId)) {
      return;
    }

    const previousOrders = ordersDnd;
    const previousStatus = findOrderStatus(previousOrders, orderId);
    const nextOrders = move(previousOrders, event);
    const nextStatus = findOrderStatus(nextOrders, orderId);

    if (!previousStatus || !nextStatus) {
      return;
    }

    setOrdersDnd(nextOrders);

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
    <main className="h-svh w-full bg-bg-dark flex flex-col gap-10 items-center overflow-hidden">
      <div className="justify-self-center flex justify-end items-center py-2 px-4 bg-bg-light rounded-sm shadow-md mt-3 mr-60 border border-alt-dark">
        <input
          className="text-sm font-Manrope focus:outline-none"
          placeholder="Buscar ordenes"
        />

        <div className="w-11/12 h-full bg-transparent flex justify-center items-center rounded-r-md">
          <Search className="w-6 h-6 text-black" />
        </div>
      </div>

      <DragDropProvider
        onDragOver={(event) => event.preventDefault()}
        onDragEnd={handleDragEnd}>
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
