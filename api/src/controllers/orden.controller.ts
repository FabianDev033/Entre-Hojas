import { createCrudController } from "./crud.controller.js";
import ordenService from "../services/orden.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";
import { parseId } from "../utils/request.js";

const crudController = createCrudController(ordenService, ["fecha", "estado", "total", "clientes_id"], ["total", "clientes_id"]);

export default {
  ...crudController,
  checkout: asyncHandler(async (request, response) => {
    const { items, customer } = request.body as Record<string, unknown>;
    if (!Array.isArray(items) || items.length === 0) {
      throw new HttpError(400, "items must be a non-empty array.");
    }
    if (!customer || typeof customer !== "object") {
      throw new HttpError(400, "customer is required.");
    }
    const contact = customer as Record<string, unknown>;
    if (typeof contact.nombre !== "string" || !contact.nombre.trim() || typeof contact.direccion !== "string" || !contact.direccion.trim()) {
      throw new HttpError(400, "customer nombre and direccion are required.");
    }
    if (contact.telefono !== undefined && typeof contact.telefono !== "string") {
      throw new HttpError(400, "customer telefono must be a string.");
    }
    const parsedItems = items.map((item) => {
      if (!item || typeof item !== "object") throw new HttpError(400, "Each item must be an object.");
      const value = item as Record<string, unknown>;
      if (!Number.isInteger(value.plantId) || (value.plantId as number) < 1 || !Number.isInteger(value.quantity) || (value.quantity as number) < 1) {
        throw new HttpError(400, "Each item requires a positive integer plantId and quantity.");
      }
      return { plantId: value.plantId as number, quantity: value.quantity as number };
    });
    response.status(201).json(await ordenService.checkout({
      items: parsedItems,
      customer: { nombre: contact.nombre.trim(), direccion: contact.direccion.trim(), telefono: contact.telefono?.trim() || undefined },
    }));
  }),
  findOrderDetailById: asyncHandler(async (request, response) => {
    response.json(await ordenService.findOrderDetailById(parseId(request.params.id)));
  }),
};
