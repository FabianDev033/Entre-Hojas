import ordenModel, {
  type Orden,
  type OrdenCheckoutInput,
  orderStatuses,
  type OrderStatus,
} from "../models/orden.model.js";
import { BaseService } from "./base.service.js";
import { HttpError } from "../utils/http-error.js";
class OrdenService extends BaseService<Orden> {
  async updateStatus(id: number, estado: string) {
    if (!orderStatuses.includes(estado as OrderStatus)) {
      throw new HttpError(400, "Invalid order status.");
    }

    const order = await ordenModel.updateStatus(id, estado as OrderStatus);
    if (!order) {
      throw new HttpError(404, "Order not found.");
    }
    return order;
  }

  async checkout(input: OrdenCheckoutInput) {
    try {
      return await ordenModel.createFromCheckout(input);
    } catch (error) {
      if (error instanceof Error && error.message === "PLANT_NOT_FOUND") {
        throw new HttpError(404, "One or more plants were not found.");
      }
      if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
        throw new HttpError(409, "Insufficient stock for one or more plants.");
      }
      throw error;
    }
  }
  async findAllWithDetails() {
    return ordenModel.findAllWithDetails();
  }
  async findOrderDetailById(id: number) {
    const order = await ordenModel.findOrderDetailById(id);
    if (!order) {
      throw new HttpError(404, "Order not found.");
    }
    return order;
  }
}
export default new OrdenService(ordenModel);
