import { createCrudController } from "./crud.controller.js";
import plantaService from "../services/planta.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";
import { parseId } from "../utils/request.js";
import type { Planta } from "../models/planta.model.js";
import { parsePlantCreate, parsePlantEdit } from "../utils/plant-edit.js";

const plantFields = ["nombre", "familia", "precio", "discount", "stock", "habilitado", "etiqueta", "origen", "tipo", "iluminacion", "resistencia", "tamano", "cuidado", "petFriendly", "descripcion"] as const satisfies readonly (keyof Planta & string)[];
const crudController = createCrudController(plantaService, plantFields, ["nombre", "precio", "stock"]);

export default {
  ...crudController,
  createProduct: asyncHandler(async (request, response, next) => {
    // Preserve the existing JSON endpoint for other clients.
    if (!request.is("multipart/form-data")) {
      return crudController.create(request, response, next);
    }
    let input: unknown;
    try {
      input = JSON.parse(request.body?.datos);
    } catch {
      throw new HttpError(400, "Datos de producto inválidos.");
    }
    const data = parsePlantCreate(input);
    response.status(201).json(await plantaService.createWithImages(data, (request.files as Express.Multer.File[] | undefined) ?? []));
  }),
  findEditById: asyncHandler(async (request, response) => {
    response.json(await plantaService.findEditById(parseId(request.params.id)));
  }),
  saveEdit: asyncHandler(async (request, response) => {
    let input: unknown;
    try {
      input = JSON.parse(request.body?.datos);
    } catch {
      throw new HttpError(400, "Datos de producto inválidos.");
    }
    const { data, removedImageIds } = parsePlantEdit(input);
    response.json(await plantaService.saveEdit(parseId(request.params.id), data, removedImageIds, (request.files as Express.Multer.File[] | undefined) ?? []));
  }),
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
