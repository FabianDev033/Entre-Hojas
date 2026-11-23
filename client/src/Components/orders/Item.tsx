import { useState, type ReactNode } from "react";
import { useSortable } from "@dnd-kit/react/sortable";

import { Arrow2, Location, Phone } from "../../assets/icons";

type ItemProps = {
  id: string | number;
  children: ReactNode;
  index: number;
  column?: string;
  order?: Order;
};

export type OrderItem = {
  plantId: number;
  nombre: string;
  familia: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};
export type OrderCustomer = { nombre: string; telefono: string | null };
export type PaymentMethod = "transferencia" | "mercado_pago" | "efectivo";
export type Order = {
  id: number;
  fecha: string | null;
  estado: string | null;
  total: number;
  clientes_id: number;
  direccion: string | null;
  detalleUbicacion: string | null;
  latitud: number | null;
  longitud: number | null;
  medioPago: PaymentMethod | null;
  cliente: OrderCustomer;
  items: OrderItem[];
};

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export default function Item({ id, index, column, order }: ItemProps) {
  const { ref, isDragging, handleRef } = useSortable({
    id,
    index,
    type: "item",
    accept: column === "search" ? [] : "item",
    group: column,
  });
  const [open, setOpen] = useState(false);

  const displayPaymentMethod = order?.medioPago
    ? {
        transferencia: "Transferencia",
        mercado_pago: "Mercado Pago",
        efectivo: "Efectivo",
      }[order.medioPago]
    : "Pago no informado";
  const phone = order?.cliente.telefono?.replace(/\D/g, "") ?? "";
  const whatsappUrl = phone
    ? `https://wa.me/${phone.startsWith("54") ? phone : `54${phone.replace(/^0+/, "")}`}`
    : null;
  const mapQuery =
    order?.latitud != null && order.longitud != null
      ? `${order.latitud},${order.longitud}`
      : order?.direccion;
  const mapsUrl = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : null;
  const addressParts = order?.direccion
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const address = addressParts?.length
    ? [addressParts[0]?.replace(/^D\d+\s*/, "")].filter(Boolean).join(", ")
    : "Sin dirección";
  const displayDate = order?.fecha
    ? order.fecha.slice(0, 10).split("-").reverse().join("/")
    : "Sin fecha";

  return (
    <div
      ref={ref}
      data-order-id={order?.id}
      data-dragging={isDragging}
      className={`relative mb-3 flex min-h-15 flex-col justify-between rounded-sm border bg-bg-light py-3 ${
        isDragging ? "opacity-50" : ""
      } ${
        column === "confirmed"
          ? "border-primary-dark shadow-[0_5px_5px_rgba(74,111,68,.3)]"
          : column === "canceled"
            ? "border-alt-dark shadow-[0_5px_5px_rgba(105,68,111,.3)]"
            : "border-black/70 shadow-md"
      }`}>
      <div
        ref={handleRef}
        aria-hidden="true"
        className="absolute left-0 top-0 h-full w-6 cursor-grab after:absolute after:inset-0 after:bg-linear-to-r after:from-[#4A6F44]/50 after:to-transparent after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100"
      />
      <div className="flex w-full items-center gap-2 px-3">
        <span className="min-w-0 flex-1 truncate font-Outfit text-base">
          {order?.cliente.nombre}
        </span>
        <span className="shrink-0 text-xs text-black/85">#{order?.id}</span>
        <button
          type="button"
          aria-label={`${open ? "Contraer" : "Expandir"} orden ${order?.id ?? ""}`}
          aria-expanded={open}
          onClick={() => setOpen((previous) => !previous)}
          className="z-10 shrink-0 rounded p-1 focus-visible:outline-2 focus-visible:outline-primary-dark">
          <Arrow2
            className={`h-4 w-4 transition-transform duration-200 ${open ? "-rotate-90" : "rotate-90"}`}
          />
        </button>
      </div>

      {open && (
        <div className="mt-3 w-full px-3 font-Manrope text-xs font-light text-black sm:text-sm">
          <div className="border-t border-black/30 pt-3">
            <div className="grid grid-cols-2 gap-3">
            <section className="min-w-0 flex flex-col gap-3">
              <h3 className="font-normal uppercase text-black">Entrega</h3>
              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Abrir dirección en Maps: ${address}`}
                  className="flex items-center gap-2 hover:text-secondary focus-visible:outline-2 focus-visible:outline-primary-dark">
                  <Location className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="flex min-w-0 flex-col">
                    <span className="break-words">{address}</span>
                    {order?.detalleUbicacion && (
                      <span className="break-words">
                        {order.detalleUbicacion}
                      </span>
                    )}
                  </span>
                </a>
              ) : (
                <div className="flex items-center gap-2">
                  <Location className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="flex min-w-0 flex-col">
                    <span className="break-words">{address}</span>
                    {order?.detalleUbicacion && (
                      <span className="break-words">
                        {order.detalleUbicacion}
                      </span>
                    )}
                  </span>
                </div>
              )}

              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Contactar al ${order?.cliente.telefono ?? "cliente"} por WhatsApp`}
                  className="flex items-center gap-2 break-words hover:text-secondary focus-visible:outline-2 focus-visible:outline-primary-dark">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{order?.cliente.telefono}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="break-words">
                    {order?.cliente.telefono ?? "Sin teléfono"}
                  </span>
                </div>
              )}
            </section>

            <section className="min-w-0 flex flex-col gap-3">
              <h3 className="font-normal uppercase text-black">Pedido</h3>
              {order?.items.map((plant) => (
                <div
                  key={plant.plantId}
                  className="flex min-w-0 items-start gap-2">
                  <span
                    style={{ backgroundColor: "var(--bg4)" }}
                    className="inline-flex min-w-8 shrink-0 items-center justify-center rounded-md border border-black/60 px-2 py-1">
                    x{plant.cantidad}
                  </span>
                  <span className="wrap-break-word">
                    {[plant.familia, plant.nombre].filter(Boolean).join(" ")}
                  </span>
                </div>
              ))}
            </section>
          </div>

            <div className="mt-3 flex flex-col gap-1 border-t border-black/30 pt-3">
              <span className="font-Outfit text-3xl font-normal">
                {currencyFormatter.format(order?.total ?? 0)}
              </span>
              <div className="flex flex-wrap justify-between gap-x-2 gap-y-1 text-black/80">
                <span>{displayPaymentMethod}</span>
                <time>{displayDate}</time>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
