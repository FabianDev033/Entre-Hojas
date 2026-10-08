import { createCrudController } from "./crud.controller.js";
import plantaService from "../services/planta.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";
import { parseId } from "../utils/request.js";
import type { Planta } from "../models/planta.model.js";

const plantFields = ["nombre", "familia", "precio", "discount", "stock", "etiqueta", "origen", "tipo", "iluminacion", "resistencia", "tamano", "cuidado", "descripcion"] as const satisfies readonly (keyof Planta & string)[];
const crudController = createCrudController(plantaService, plantFields, ["nombre", "precio", "stock"]);

export default {
  ...crudController,
  findById: asyncHandler(async (request, response) => {
    response.json(await plantaService.findDetailById(parseId(request.params.id)));
  }),
  findByFamily: asyncHandler(async (request, response) => {
    const familia = request.params.familia;
    if (typeof familia !== "string" || !familia.trim()) {
      throw new HttpError(400, "familia must be a non-empty value.");
    }
    response.json(await plantaService.findByFamily(familia));
  }),
  findAllInventory: asyncHandler(async (_request, response) => {
    response.json(await plantaService.findAllInventory());
  }),
  updateStock: asyncHandler(async (request, response) => {
    const body = request.body as Record<string, unknown> | undefined;
    if (!body || !Number.isSafeInteger(body.cantidad) || (body.cantidad as number) < 1) {
      throw new HttpError(400, "cantidad must be a positive integer.");
    }
    response.json(await plantaService.addStock(parseId(request.params.id), body.cantidad as number));
  }),
};
