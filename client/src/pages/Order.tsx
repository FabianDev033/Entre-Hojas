import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Cart, HourGlass, User2 } from "../assets/icons";

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
    apellido: string;
    telefono: string | null;
  };
  items: OrderItem[];
}

function formatMoney(value: number) {
  return `$ ${Math.round(value).toLocaleString("es-AR")}`;
}

export default function Order() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const displayAddress = order?.direccion
  ? `${order.direccion.split(",")[0].trim()}, ${order.direccion.split(",").at(-1)?.trim()}`
  : "";
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

    if (!orderId) {
      setError("El identificador de la orden no es válido.");
      setIsLoading(false);
      return () => controller.abort();
    }

    void loadOrder();
    return () => controller.abort();
  }, [orderId]);

  if (isLoading) {
    return <main className="min-h-svh bg-bg-light p-6 font-Manrope text-black">Cargando orden...</main>;
  }

  if (error || !order) {
    return <main className="min-h-svh bg-bg-light p-6 font-Manrope text-red-700">{error ?? "No se encontró la orden."}</main>;
  }

  return (
    <main className="min-h-[90svh] bg-bg-light relative flex flex-col gap-10 justify-start items-center">
      <div className="bg-[linear-gradient(to_bottom,#A8C09A_0%,#A8C09A_40%,#F5F1E8_100%)] h-63 w-screen absolute z-0" />
      <section className="w-full flex flex-col justify-center items-center gap-3 text-black font-Outfit font-light z-10 relative text-center">
        <h2 className="font-semibold text-3xl">ORDEN CONFIRMADA</h2>
        <span className="text-lg">Muchas gracias por confiar en Entre Hojas</span>
      </section>
      <section className="w-full px-1 flex flex-col justify-center items-center gap-3 text-black font-Outfit font-light z-10 relative text-center">
        <div className="flex relative items-center gap-2 font-Outfit font-normal text-lg self-start">
          <HourGlass className="h-6 w-6" />
          <span>Pedido en proceso</span>
        </div>
      </section>
      <section className="w-full px-1 flex flex-col gap-4 justify-center items-center text-black text-sm font-Manrope font-light relative z-10">
        <div className="flex relative items-center gap-2 font-Outfit font-normal text-lg self-start">
          <Cart className="h-5 w-5" />
          <span>Tu pedido</span>
          <span className="text-black/60 font-Manrope font-light">#{orderId}</span>
        </div>
        <div className="w-10/12">
          {order.items.map((item) => (
            <div key={item.plantId} className="flex justify-between gap-4 w-full">
              <span>{item.cantidad} x {[item.familia, item.nombre].filter(Boolean).join(" ")}</span>
              <span>{formatMoney(item.subtotal)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-black/30 pt-3 font-Outfit font-normal text-lg w-full">
            <span>Total</span>
            <span>{formatMoney(order.total)}</span>
          </div>
        </div>
      </section>
      <section className="w-full px-1 flex flex-col justify-center items-center gap-3 text-black font-Outfit font-light z-10 relative text-center">
        <div className="flex relative items-center gap-2 font-Outfit font-normal text-lg self-start">
          <User2 className="h-6 w-6 text-black" />
          <span>Tus datos de contacto</span>
        </div>
        <div className="w-10/12 flex flex-col gap-2">
          <p className="text-left">Nombre: {order.cliente.nombre}</p>
          {order.cliente.telefono && <p className="text-left">Teléfono: {order.cliente.telefono}</p>}
          {order.direccion && <p className="text-left">Dirección: {displayAddress}</p>}
        </div>
      </section>
      <section className='w-full h-22 flex flex-col gap-3 justify-between items-center text-black text-xl font-Outfit font-light bg-bg-light fixed bottom-0 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.25)]'>
            
            <button className="w-11/12 py-2 mt-3 bg-primary-dark/80 text-bg-light rounded-md shadow-md cursor-pointer">
                Seguir comprando
            </button>
        </section>
    </main>
  );
}
