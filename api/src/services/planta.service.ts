import plantaModel, { type Planta } from "../models/planta.model.js";
import { BaseService } from "./base.service.js";
import { HttpError } from "../utils/http-error.js";

class PlantaService extends BaseService<Planta> {
  constructor() {
    super(plantaModel);
  }

  async findDetailById(id: number) {
    const planta = await plantaModel.findDetailById(id);
    if (!planta) throw new HttpError(404, "Plant not found.");
    return planta;
  }

  findByFamily(familia: string) {
    return plantaModel.findByFamily(familia);
  }

  findAllInventory() {
    return plantaModel.findAllInventory();
  }

  async addStock(id: number, amount: number) {
    const plant = await plantaModel.addStock(id, amount);
    if (!plant) throw new HttpError(404, "Plant not found.");
    return plant;
  }
}

export default new PlantaService();
