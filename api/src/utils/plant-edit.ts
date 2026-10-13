import type { Planta } from "../models/planta.model.js";
import { HttpError } from "./http-error.js";
import { parsePetFriendly } from "./pet-friendly.js";

export type PlantEditData = Omit<Planta, "id" | "stock" | "petFriendly"> & {
  etiquetas: string[];
  petFriendly?: boolean | null;
};

const labels = ["", "promo", "oferta", "ultimo", "top", "nuevo", "volvio", "elegido", "limitada", "regalo"];
const textLimits = {
  nombre: 100, familia: 100, etiqueta: 50, origen: 100, tipo: 50,
  iluminacion: 50, resistencia: 50, tamano: 50, cuidado: 65_535, descripcion: 65_535,
} as const;
const selectOptions = {
  tamano: ["Pequeño", "Mediano", "Grande"],
  iluminacion: ["Poca", "Media", "Mucha"],
  resistencia: ["Poca", "Media", "Mucha"],
  cuidado: ["Fácil", "Medio", "Difícil"],
} as const;

export function parsePlantEdit(body: unknown): { data: PlantEditData; removedImageIds: number[] } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "Datos de producto inválidos.");
  }
  const input = body as Record<string, unknown>;
  const allowedFields = [...Object.keys(textLimits), "precio", "discount", "etiquetas", "petFriendly", "imagenesEliminadas"];
  if (Object.keys(input).some((key) => !allowedFields.includes(key))) {
    throw new HttpError(400, "La edición no admite stock, ventas ni otros campos adicionales.");
  }

  const data: PlantEditData = {
    nombre: "", precio: 0, discount: 0, familia: null, etiqueta: null, origen: null,
    tipo: null, iluminacion: null, resistencia: null, tamano: null, cuidado: null, descripcion: null, etiquetas: [],
  };
  // Older editors omit the field: preserve the stored value in that case.
  if (input.petFriendly !== undefined) data.petFriendly = parsePetFriendly(input.petFriendly);
  for (const [field, limit] of Object.entries(textLimits)) {
    const key = field as keyof typeof textLimits;
    const value = input[key];
    if (value !== null && typeof value !== "string") {
      throw new HttpError(400, `El campo ${key} debe ser texto.`);
    }
    const text = value?.trim() ?? "";
    if (text.length > limit || Buffer.byteLength(text, "utf8") > 65_535) {
      throw new HttpError(400, `El campo ${key} es demasiado largo.`);
    }
    if (key === "nombre") data.nombre = text;
    else data[key] = text || null;
  }
  if (!data.nombre) throw new HttpError(400, "Ingresá el nombre del producto.");
  for (const [field, options] of Object.entries(selectOptions)) {
    const key = field as keyof typeof selectOptions;
    const value = data[key];
    if (value === null) continue;
    const selected = options.find((option) => option.localeCompare(value, "es", { sensitivity: "base" }) === 0);
    if (!selected) throw new HttpError(400, `Elegí una opción válida para ${key}: ${options.join(", ")}.`);
    data[key] = selected;
  }
  if (!labels.includes(data.etiqueta ?? "")) throw new HttpError(400, "Elegí una etiqueta válida.");
  if (!Array.isArray(input.etiquetas) || input.etiquetas.some((label) => typeof label !== "string" || !label || !labels.includes(label))) {
    throw new HttpError(400, "Elegí etiquetas válidas.");
  }
  data.etiquetas = [...new Set(input.etiquetas as string[])];
  if (data.etiquetas.length ? !data.etiquetas.includes(data.etiqueta ?? "") : data.etiqueta !== null) {
    throw new HttpError(400, "La etiqueta visible debe ser una de las etiquetas asignadas.");
  }

  const price = input.precio;
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0 || price > 99_999_999.99 || Math.abs(price * 100 - Math.round(price * 100)) > 0.00001) {
    throw new HttpError(400, "El precio debe ser un número no negativo con hasta dos decimales.");
  }
  const discount = input.discount;
  if (typeof discount !== "number" || !Number.isInteger(discount) || discount < 0 || discount > 100) {
    throw new HttpError(400, "El descuento debe ser un entero entre 0 y 100.");
  }
  if (data.etiquetas.includes("oferta") && discount === 0) {
    throw new HttpError(400, "La etiqueta Oferta requiere un descuento mayor a cero.");
  }
  data.precio = price;
  data.discount = discount;

  const removed = input.imagenesEliminadas;
  if (!Array.isArray(removed) || removed.some((id) => !Number.isSafeInteger(id) || id < 1)) {
    throw new HttpError(400, "La lista de imágenes a quitar es inválida.");
  }
  return { data, removedImageIds: [...new Set(removed as number[])] };
}
