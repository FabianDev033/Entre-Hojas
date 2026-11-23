import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Cart, LeafCategory, AcceptMini } from "../../assets/icons";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

interface OrderItem {
  plantId: number;
  nombre: string;
  familia: string | null;
  cantidad: number;
  subtotal: number;
}

interface OrderData {
  total: number;
  direccion: string | null;
  cliente: {
    nombre: string;
    telefono: string | null;
  };
  items: OrderItem[];
}

function formatMoney(value: number) {
  return `$ ${Math.round(value).toLocaleString("es-AR")}`;
}

export default function Order() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadOrder = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<OrderData>(
          `${API_BASE_URL}/api/ordenes/${encodeURIComponent(orderId ?? "")}`,
          { signal: controller.signal },
        );
        if (!controller.signal.aborted) setOrder(response.data);
      } catch (requestError) {
        if (!axios.isCancel(requestError) && !controller.signal.aborted) {
          setError("No pudimos encontrar esta orden o cargar sus datos.");
          setOrder(null);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    if (!orderId) return () => controller.abort();

    void loadOrder();
    return () => controller.abort();
  }, [orderId]);

  if (!orderId || isLoading || error || !order) {
    return (
      <main className="flex min-h-[calc(100svh-3rem)] items-center justify-center bg-[color-mix(in_srgb,var(--pri1)_30%,var(--bg1))] px-4 font-Manrope text-black">
        <p
          role={!orderId || error ? "alert" : "status"}
          className={error || !orderId ? "text-cancel" : ""}>
          {!orderId
            ? "El identificador de la orden no es válido."
            : isLoading
              ? "Cargando orden..."
              : (error ?? "No se encontró la orden.")}
        </p>
      </main>
    );
  }

  const displayAddress = order.direccion
    ? `${order.direccion.split(",")[0].trim()}, ${order.direccion.split(",").at(-1)?.trim()}`
    : null;

  return (
    <main className="relative flex min-h-[calc(100svh-3rem)] flex-col items-center bg-bg-order px-4 pb-24 pt-6 text-black sm:px-6 sm:pt-8">
      <article className="relative z-10 w-full max-w-2xl overflow-visible rounded-3xl bg-[#fff] shadow-md">
        <section className="flex flex-col items-center px-5 pb-6 pt-6 text-center sm:px-7 sm:pt-8">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary-dark text-white">
            <AcceptMini />
          </div>
          <h1 className="mt-3 font-Outfit text-2xl font-semibold text-primary-darkest sm:text-3xl">
            ¡Orden confirmada!
          </h1>
          <p className="mt-2 font-Manrope text-sm text-primary-darkest/80 sm:text-base">
            Muchas gracias por confiar en Entre Hojas
          </p>
        </section>

        <div className="relative border-t-4 border border-bg-order before:absolute before:-left-3 before:-top-3 before:size-6 before:rounded-full before:bg-bg-order after:absolute after:-right-3 after:-top-3 after:size-6 after:rounded-full after:bg-bg-order" />

        <section
          aria-labelledby="order-summary"
          className="px-5 py-5 sm:px-7 sm:py-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary-dark">
              <Cart aria-hidden="true" className="size-5" />
            </span>
            <h2
              id="order-summary"
              className="font-Outfit text-lg font-semibold text-primary-darkest sm:text-xl">
              Tu pedido
            </h2>
            <span className="ml-auto rounded-full bg-primary/20 px-3 py-1 font-Manrope font-semibold text-primary-dark">
              #{orderId}
            </span>
          </div>

          <ul className="divide-y divide-bg-darker">
            {order.items.map((item) => (
              <li
                key={item.plantId}
                className="flex items-center gap-3 py-3 first:pt-0">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/25 text-primary-dark">
                  <LeafCategory aria-hidden="true" className="size-8" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-Manrope text-sm font-medium leading-snug text-primary-darkest sm:text-base">
                    {[item.familia, item.nombre].filter(Boolean).join(" ")}
                  </p>
                  <p className="font-Manrope text-sm text-primary-darkest/70">
                    {item.cantidad}{" "}
                    {item.cantidad === 1 ? "unidad" : "unidades"}
                  </p>
                </div>
                <p className="shrink-0 font-Outfit text-lg font-semibold text-primary-darkest sm:text-base">
                  {formatMoney(item.subtotal)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-2 flex items-center justify-between border-t border-bg-darker pt-3 font-Outfit font-semibold text-primary-darkest">
            <span className="text-lg">Total</span>
            <span className="text-xl sm:text-2xl">
              {formatMoney(order.total)}
            </span>
          </div>
        </section>

        <section
          aria-labelledby="contact-details"
          className="border-t-4 border-dashed border-bg-order px-5 py-5 sm:px-7 sm:py-6">
          <h2
            id="contact-details"
            className="mb-2 font-Outfit text-sm font-semibold uppercase text-primary-darkest/75">
            Tus datos de contacto
          </h2>
          <div className="space-y-1.5 font-Manrope text-sm text-primary-darkest sm:text-base">
            <p>Nombre: {order.cliente.nombre}</p>
            {order.cliente.telefono && (
              <p>Teléfono: {order.cliente.telefono}</p>
            )}
            {displayAddress && (
              <p className="break-words">Dirección: {displayAddress}</p>
            )}
          </div>
        </section>
      </article>

      <div className="mt-6 w-full max-w-2xl px-1">
        <button
          type="button"
          className="mx-auto block w-full max-w-2xl rounded-full bg-primary-dark px-6 py-3 font-Manrope text-base font-normal text-white transition-colors hover:bg-primary-darkest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-darkest"
          onClick={() => navigate("/")}>
          Seguir comprando
        </button>
      </div>
    </main>
  );
}
