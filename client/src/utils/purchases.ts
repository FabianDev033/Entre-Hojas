import axios from "axios";

export const purchasesApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api`,
  withCredentials: true,
});
export const purchaseTypes = [
  { value: "planta", label: "Planta" },
  { value: "maceta", label: "Maceta" },
  { value: "insumo", label: "Insumo" },
  { value: "herramienta", label: "Herramienta" },
  { value: "otro", label: "Otro" },
] as const;
export type PurchaseItem = {
  descripcion: string;
  plantaFamilia?: string | null;
  tipo: (typeof purchaseTypes)[number]["value"];
  plantaId: number | null;
  cantidad: number;
  precioUnitario: number;
};
export type Purchase = {
  id: number;
  fecha: string;
  proveedor: string;
  observaciones: string;
  total: number;
  anulada: boolean;
  stockAplicado: boolean;
  version: number;
  items: PurchaseItem[];
};
export const purchaseMoney = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
export const itemSubtotal = (
  item: Pick<PurchaseItem, "precioUnitario" | "cantidad">,
) => (Math.round(item.precioUnitario * 100) * item.cantidad) / 100;
export const purchaseDate = (value: string) =>
  value.split("-").reverse().join("/");
export const todayDate = () =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());
export function purchaseError(error: unknown, fallback: string): string {
  return axios.isAxiosError<{ error: string }>(error) &&
    error.response?.data.error
    ? error.response.data.error
    : fallback;
}
