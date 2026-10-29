import { HttpError } from "./http-error.js";

export function parseEnabled(value: unknown): boolean {
  if (typeof value !== "boolean") {
    throw new HttpError(400, "habilitado debe ser verdadero o falso.");
  }
  return value;
}
