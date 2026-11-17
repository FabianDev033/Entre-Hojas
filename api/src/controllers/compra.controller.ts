import compraService from "../services/compra.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { parseId } from "../utils/request.js";
import { parsePurchaseDate } from "../utils/purchase-input.js";
import { HttpError } from "../utils/http-error.js";

export default {
  findAll: asyncHandler(async (request, response) => {
    const from =
      request.query.desde === undefined
        ? undefined
        : parsePurchaseDate(request.query.desde);
    const to =
      request.query.hasta === undefined
        ? undefined
        : parsePurchaseDate(request.query.hasta);
    if (from && to && from > to)
      throw new HttpError(
        400,
        "La fecha desde no puede ser posterior a hasta.",
      );
    response.json(await compraService.findAll(from, to));
  }),
  findById: asyncHandler(async (request, response) => {
    response.json(await compraService.findById(parseId(request.params.id)));
  }),
  create: asyncHandler(async (request, response) => {
    response.status(201).json(await compraService.create(request.body));
  }),
  update: asyncHandler(async (request, response) => {
    response.json(
      await compraService.update(parseId(request.params.id), request.body),
    );
  }),
  cancel: asyncHandler(async (request, response) => {
    response.json(
      await compraService.cancel(parseId(request.params.id), request.body),
    );
  }),
};
