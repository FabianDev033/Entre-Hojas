import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
export type OrderStatus =
  | "pending"
  | "ready"
  | "shipped"
  | "confirmed"
  | "canceled";
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
  estadoActualizado: string | null;
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
export type OrdersByStatus = Record<OrderStatus, Order[]>;
type OrdersContextType = {
  allOrders: Order[];
  orders: OrdersByStatus;
  isLoading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (id: number, status: OrderStatus) => Promise<void>;
};
const emptyOrders = (): OrdersByStatus => ({
  pending: [],
  ready: [],
  shipped: [],
  confirmed: [],
  canceled: [],
});
const statusByApiValue: Record<string, OrderStatus> = {
  pendiente: "pending",
  pending: "pending",
  listo: "ready",
  ready: "ready",
  enviado: "shipped",
  shipped: "shipped",
  confirmado: "confirmed",
  confirmed: "confirmed",
  cancelado: "canceled",
  canceled: "canceled",
  cancelled: "canceled",
};
const getOrderStatus = (status: string | null): OrderStatus => {
  return statusByApiValue[status?.toLowerCase() ?? ""] ?? "pending";
};
const getOrders = () =>
  axios.get<Order[]>(`${API_BASE_URL}/api/ordenes`, {
    withCredentials: true,
  });

const apiStatusByOrderStatus: Record<OrderStatus, string> = {
  pending: "pendiente",
  ready: "listo",
  shipped: "enviado",
  confirmed: "confirmado",
  canceled: "cancelado",
};
const isInCurrentWeek = (date: string | null) => {
  if (!date) return false;

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return false;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return value >= start && value < end;
};

const groupOrdersByStatus = (orders: Order[]): OrdersByStatus => {
  return orders.reduce<OrdersByStatus>((grouped, order) => {
    const status = getOrderStatus(order.estado);
    const isTerminalStatus = status === "confirmed" || status === "canceled";
    if (isTerminalStatus && !isInCurrentWeek(order.estadoActualizado ?? order.fecha)) {
      return grouped;
    }
    grouped[status].push(order);
    return grouped;
  }, emptyOrders());
};
const OrdersContext = createContext<OrdersContextType | null>(null);
export function OrdersProvider({ children }: { children: ReactNode }) {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getOrders();
      setAllOrders(response.data);
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("No se pudieron cargar las órdenes.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    void refreshOrders();
  }, [refreshOrders]);

  const updateOrderStatus = useCallback(
    async (id: number, status: OrderStatus) => {
      const response = await axios.patch<Order>(
        `${API_BASE_URL}/api/ordenes/${id}/estado`,
        { estado: apiStatusByOrderStatus[status] },
        { withCredentials: true },
      );

      setAllOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === id
            ? {
                ...order,
                estado: response.data.estado,
                estadoActualizado: response.data.estadoActualizado,
              }
            : order,
        ),
      );
    },
    [],
  );

  const orders = useMemo(() => groupOrdersByStatus(allOrders), [allOrders]);
  const value = useMemo<OrdersContextType>(
    () => ({ allOrders, orders, isLoading, error, refreshOrders, updateOrderStatus }),
    [allOrders, orders, isLoading, error, refreshOrders, updateOrderStatus],
  );
  return (
    <OrdersContext.Provider value={value}> {children} </OrdersContext.Provider>
  );
}
//eslint-disable-next-line react-refresh/only-export-components
export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders debe usarse dentro de OrdersProvider");
  }
  return context;
}
