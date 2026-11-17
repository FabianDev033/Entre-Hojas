import { HttpError } from "./http-error.js";

export const purchaseTypes = [
  "planta",
  "maceta",
  "insumo",
  "herramienta",
  "otro",
] as const;
export type PurchaseItem = {
  descripcion: string;
  plantaFamilia?: string | null;
  tipo: (typeof purchaseTypes)[number];
  cantidad: number;
  precioUnitario: number;
  plantaId: number | null;
};
export type PurchaseInput = {
  fecha: string;
  proveedor: string;
  observaciones: string;
  items: PurchaseItem[];
};

export function parsePurchaseDate(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value < "1000-01-01" ||
    value > "9999-12-31" ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  ) {
    throw new HttpError(
      400,
      "La fecha debe ser válida y tener formato AAAA-MM-DD.",
    );
  }
  return value;
}

function text(
  value: unknown,
  name: string,
  max: number,
  required = false,
): string {
  if (
    typeof value !== "string" ||
    value.trim().length > max ||
    (required && !value.trim())
  ) {
    throw new HttpError(400, `Revisá ${name} (máximo ${max} caracteres).`);
  }
  return value.trim();
}

export function parsePurchaseVersion(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
    throw new HttpError(
      400,
      "La versión de la compra es obligatoria. Recargá la página.",
    );
  }
  return value;
}

export function purchaseTotal(items: PurchaseItem[]): number {
  return (
    items.reduce(
      (sum, item) =>
        sum + Math.round(item.precioUnitario * 100) * item.cantidad,
      0,
    ) / 100
  );
}

export function parsePurchaseInput(value: unknown): PurchaseInput {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new HttpError(400, "Datos de compra inválidos.");
  const body = value as Record<string, unknown>;
  if (
    !Array.isArray(body.items) ||
    body.items.length < 1 ||
    body.items.length > 100
  ) {
    throw new HttpError(400, "Agregá entre 1 y 100 ítems a la compra.");
  }
  const items = body.items.map((raw): PurchaseItem => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw new HttpError(400, "Ítem inválido.");
    const item = raw as Record<string, unknown>;
    if (!purchaseTypes.includes(item.tipo as PurchaseItem["tipo"]))
      throw new HttpError(400, "Tipo de ítem inválido.");
    if (
      typeof item.cantidad !== "number" ||
      !Number.isInteger(item.cantidad) ||
      item.cantidad < 1 ||
      item.cantidad > 2_147_483_647
    ) {
      throw new HttpError(400, "Cada cantidad debe ser un entero positivo.");
    }
    const price = item.precioUnitario;
    if (
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0 ||
      price > 99_999_999.99 ||
      Math.abs(price * 100 - Math.round(price * 100)) > 0.00001
    ) {
      throw new HttpError(
        400,
        "El precio unitario debe ser positivo o cero, con hasta dos decimales.",
      );
    }
    const plantaId = item.plantaId ?? null;
    if (item.tipo === "planta") {
      if (
        typeof plantaId !== "number" ||
        !Number.isSafeInteger(plantaId) ||
        plantaId < 1
      ) {
        throw new HttpError(
          400,
          "Seleccioná la planta de cada ítem de tipo planta.",
        );
      }
    } else if (plantaId !== null) {
      throw new HttpError(
        400,
        "Solo los ítems de tipo planta pueden vincularse al inventario.",
      );
    }
    return {
      descripcion:
        item.tipo === "planta"
          ? text(item.descripcion ?? "", "la descripción", 150)
          : text(item.descripcion, "la descripción", 150, true),
      tipo: item.tipo as PurchaseItem["tipo"],
      cantidad: item.cantidad,
      precioUnitario: Math.round(price * 100) / 100,
      plantaId: plantaId as number | null,
    };
  });
  if (purchaseTotal(items) > 99_999_999.99)
    throw new HttpError(400, "El total de la compra supera $ 99.999.999,99.");
  return {
    fecha: parsePurchaseDate(body.fecha),
    proveedor: text(body.proveedor, "el proveedor", 100, true),
    observaciones: text(body.observaciones ?? "", "el resumen", 2000),
    items,
  };
}

// Aggregate repeated plants before calculating stock changes.
export function purchaseStock(items: PurchaseItem[]): Map<number, number> {
  const stock = new Map<number, number>();
  for (const item of items)
    if (item.plantaId !== null)
      stock.set(item.plantaId, (stock.get(item.plantaId) ?? 0) + item.cantidad);
  return stock;
}
