import compraModel from "../models/compra.model.js";
import {
  parsePurchaseInput,
  parsePurchaseVersion,
} from "../utils/purchase-input.js";

export default {
  findAll: (from?: string, to?: string) => compraModel.findAll(from, to),
  findById: (id: number) => compraModel.findById(id),
  create: (body: unknown) => compraModel.save(parsePurchaseInput(body)),
  update: (id: number, body: Record<string, unknown>) =>
    compraModel.save(
      parsePurchaseInput(body),
      id,
      parsePurchaseVersion(body?.version),
    ),
  cancel: (id: number, body: Record<string, unknown>) =>
    compraModel.save(null, id, parsePurchaseVersion(body?.version)),
};
