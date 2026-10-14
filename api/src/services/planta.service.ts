import plantaModel, { type Planta } from "../models/planta.model.js";
import { BaseService } from "./base.service.js";
import { HttpError } from "../utils/http-error.js";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { uploadsDirectory } from "../config/uploads.js";
import type { PlantCreateData, PlantEditData } from "../utils/plant-edit.js";
import { parsePetFriendly } from "../utils/pet-friendly.js";
import { parseEnabled } from "../utils/product-availability.js";

function imageExtension(file: Express.Multer.File): string {
  const bytes = file.buffer;
  if (file.mimetype === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (file.mimetype === "image/png" && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
  if (file.mimetype === "image/webp" && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "webp";
  throw new HttpError(400, "Una de las imágenes no es un archivo JPG, PNG o WebP válido.");
}

async function removeUpload(url: string) {
  if (!/^\/uploads\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(url)) return;
  try {
    await unlink(join(uploadsDirectory, url.slice("/uploads/".length)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") console.error("No se pudo quitar una imagen:", error);
  }
}

class PlantaService extends BaseService<Planta> {
  constructor() {
    super(plantaModel);
  }

  create(data: Partial<Planta>) {
    if (data.petFriendly !== undefined) parsePetFriendly(data.petFriendly);
    if (data.habilitado !== undefined) parseEnabled(data.habilitado);
    return super.create(data);
  }

  update(id: number, data: Partial<Planta>) {
    if (data.petFriendly !== undefined) parsePetFriendly(data.petFriendly);
    if (data.habilitado !== undefined) parseEnabled(data.habilitado);
    return super.update(id, data);
  }

  async findEditById(id: number) {
    const plant = await plantaModel.findEditById(id);
    if (!plant) throw new HttpError(404, "No se encontró la planta.");
    return plant;
  }

  async saveEdit(id: number, data: PlantEditData, removedIds: number[], files: Express.Multer.File[]) {
    const unusedUrls = await this.withUploads(files, (urls) => plantaModel.saveEdit(id, data, removedIds, urls));
    await Promise.all(unusedUrls.map(removeUpload));
    return this.findEditById(id);
  }

  async createWithImages(data: PlantCreateData, files: Express.Multer.File[]) {
    const id = await this.withUploads(files, (urls) => plantaModel.createWithImages(data, urls));
    return this.findEditById(id);
  }

  private async withUploads<T>(files: Express.Multer.File[], save: (urls: string[]) => Promise<T>): Promise<T> {
    const uploads = files.map((file) => ({ file, url: `/uploads/${randomUUID()}.${imageExtension(file)}` }));
    const writtenUrls: string[] = [];
    try {
      if (uploads.length) await mkdir(uploadsDirectory, { recursive: true });
      for (const { file, url } of uploads) {
        writtenUrls.push(url);
        await writeFile(join(uploadsDirectory, url.slice("/uploads/".length)), file.buffer, { flag: "wx" });
      }
      return await save(writtenUrls);
    } catch (error) {
      await Promise.all(writtenUrls.map(removeUpload));
      throw error;
    }
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
