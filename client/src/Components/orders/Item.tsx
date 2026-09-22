import { useState, type ReactNode } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Arrow2 } from "../../assets/icons";
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
export type Order = {
  id: number;
  fecha: string | null;
  estado: string | null;
  total: number;
  clientes_id: number;
  direccion: string | null;
  cliente: OrderCustomer;
  items: OrderItem[];
};
export default function Item({ id, index, column, order }: ItemProps) {
  const { ref, isDragging, handleRef } = useSortable({
    id,
    index,
    type: "item",
    accept: "item",
    group: column,
  });

  const [open, setOpen] = useState(false);
  const displayAddress = order?.direccion
    ? `${order.direccion.split(",")[0].trim()}, ${order.direccion
        .split(",")[1]
        .trim()
        .replace(/^D\d+\s*/, "")}`
    : "";

  const currencyFormatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

  const displayDate = order?.fecha!.slice(0, 10).split("-").reverse().join("/");
  return (
    <div
      ref={ref}
      data-dragging={isDragging}
      className={`mb-4 py-4 border rounded-sm bg-bg-light flex flex-col justify-between items-center min-h-15 relative  ${
        isDragging ? "opacity-50" : ""
      }
        ${
          column === "confirmed"
            ? "border-primary-dark shadow-[0_5px_5px_rgba(74,111,68,.3)]"
            : column === "canceled"
              ? " border-alt-dark shadow-[0_5px_5px_rgba(105,68,111,.3)]"
              : " border-black/70 shadow-md"
        }
        `}>
      <div
        ref={handleRef}
        className="
          w-6 h-full
          absolute top-0 left-0
          cursor-grab
          after:absolute
          after:inset-y-0
          after:left-0
          after:right-0
          after:bg-linear-to-r
        after:from-[#4A6F44]/50
          after:via-[#F5F1E8]/0
          after:to-transparent
          after:opacity-0
          after:transition-opacity
          after:duration-300
          after:ease-in-out
          hover:after:opacity-100"></div>
      <div className="pl-2 pr-4 w-full h-full grid grid-cols-4 justify-center items-center place-items-center">
        <span className="col-span-2 mr-auto ">{order?.cliente.nombre}</span>
        <span className="text-xs text-black/85 ml-auto">#{order?.id}</span>
        <Arrow2
          className={`w-6 h-6 ml-auto cursor-pointer transition-all duration-200 ease-in-out ${open ? "-rotate-90" : "rotate-90"}`}
          onClick={() => setOpen((prevOpen) => !prevOpen)}
        />
      </div>
      {open && (
        <div className="w-full flex flex-col gap-5 px-2 mt-5 font-Manrope font-light text-sm transition-all duration-300 ease-in-out">
          <div className="w-full flex justify-between">
            <div className="flex flex-col gap-3">
              <span>{order?.cliente.telefono}</span>
              <span>{displayAddress}</span>
              <span>detalle</span>
              <span className="font-medium text-secondary z-10">Contacto</span>
              <span className="font-medium text-secondary z-10">Maps</span>
            </div>
            <div className="flex flex-col gap-3 pl-4 border-l border-black">
              {order?.items.map((plant) => (
                <span>
                  x{plant.cantidad} {plant.familia} {plant.nombre}
                </span>
              ))}
              <span className="font-Outfit font-normal text-2xl">
                {currencyFormatter.format(order?.total!)}
              </span>
            </div>
          </div>
          <span className="w-full text-xs text-end">{displayDate}</span>
        </div>
      )}
    </div>
  );
}
