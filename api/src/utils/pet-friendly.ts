import { HttpError } from "./http-error.js";

export function parsePetFriendly(value: unknown): boolean | null {
  if (value === null || typeof value === "boolean") return value;
  throw new HttpError(400, "El campo petFriendly debe ser true, false o null.");
}
