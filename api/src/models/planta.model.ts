import { BaseModel } from "./base.model.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/database.js";
import type { PlantCreateData, PlantEditData } from "../utils/plant-edit.js";
import { HttpError } from "../utils/http-error.js";

export interface Planta {
  id: number; nombre: string; familia: string | null; precio: number; discount: number; stock: number;
  etiqueta: string | null; origen: string | null; tipo: string | null; iluminacion: string | null;
  resistencia: string | null; tamano: string | null; cuidado: string | null; descripcion: string | null;
  petFriendly: boolean | null;
  habilitado: boolean;
}

export interface ImagenDePlanta {
  id: number;
  url: string;
  tipo: string;
}

export interface PlantaDetalle extends Planta {
  etiquetas: string[];
  imagenes: ImagenDePlanta[];
}

export interface PlantaEdicion extends PlantaDetalle {
  ventas: number;
}

export interface PlantaResumen {
  id: number;
  stock: number;
  habilitado: boolean;
  name: string;
  family: string | null;
  price: number;
  image: string | null;
  discount: number;
  label: string;
  labels: string[];
}

export interface PlantaInventario {
  id: number;
  habilitado: boolean;
  nombre: string;
  categoria: string | null;
  stock: number;
  precio: number;
  discount: number;
  ventas: number;
}

class PlantaModel extends BaseModel<Planta> {
  // MySQL returns BOOLEAN columns as 0/1. Keep the JSON API boolean-valued.
  private normalizePlant<T extends Planta>(plant: T): T {
    return { ...plant, habilitado: Boolean(plant.habilitado), petFriendly: plant.petFriendly == null ? null : Boolean(plant.petFriendly) };
  }

  async findAll(): Promise<Planta[]> {
    return (await super.findAll()).map((plant) => this.normalizePlant(plant));
  }

  async findById(id: number): Promise<Planta | null> {
    const plant = await super.findById(id);
    return plant ? this.normalizePlant(plant) : null;
  }

  async findEditById(id: number): Promise<PlantaEdicion | null> {
    const plant = await this.findDetailById(id);
    if (!plant) return null;
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT COALESCE(SUM(d.cantidad), 0) AS ventas
      FROM orden_detalle d JOIN ordenes o ON o.id = d.ordenes_id
      WHERE d.plantas_id = ? AND o.estado IN ('confirmado', 'entregado')
    `, [id]);
    return { ...plant, ventas: Number(rows[0].ventas) };
  }

  async saveEdit(id: number, data: PlantEditData, removedIds: number[], newUrls: string[]): Promise<string[]> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [plants] = await connection.execute<RowDataPacket[]>("SELECT id FROM plantas WHERE id = ? FOR UPDATE", [id]);
      if (!plants.length) throw new HttpError(404, "No se encontró la planta.");
      const [images] = await connection.execute<RowDataPacket[]>("SELECT id, url FROM imagenes WHERE plantas_id = ? FOR UPDATE", [id]);
      if (removedIds.some((imageId) => !images.some((image) => image.id === imageId))) {
        throw new HttpError(400, "Una imagen a quitar ya no pertenece a esta planta. Recargá la página.");
      }
      const fields = this.fields
        .filter((field) => field !== "stock")
        .filter((field) => data[field] !== undefined);
      await connection.execute(
        `UPDATE plantas SET ${fields.map((field) => `\`${field}\` = ?`).join(", ")}, etiquetas = ?, actualizado = NOW() WHERE id = ?`,
        [...fields.map((field) => data[field] ?? null), JSON.stringify(data.etiquetas), id],
      );
      for (const imageId of removedIds) {
        await connection.execute("DELETE FROM imagenes WHERE id = ? AND plantas_id = ?", [imageId, id]);
      }
      for (const url of newUrls) {
        await connection.execute("INSERT INTO imagenes (url, plantas_id, tipo) VALUES (?, ?, 'detail')", [url, id]);
      }
      const unusedUrls: string[] = [];
      for (const image of images.filter((image) => removedIds.includes(image.id))) {
        const [references] = await connection.execute<RowDataPacket[]>("SELECT id FROM imagenes WHERE url = ? LIMIT 1", [image.url]);
        if (!references.length) unusedUrls.push(String(image.url));
      }
      await connection.commit();
      return unusedUrls;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async createWithImages(data: PlantCreateData, newUrls: string[]): Promise<number> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO plantas (${this.fields.map((field) => `\`${field}\``).join(", ")}, etiquetas) VALUES (${this.fields.map(() => "?").join(", ")}, ?)`,
        [...this.fields.map((field) => data[field] ?? null), JSON.stringify(data.etiquetas)],
      );
      for (const url of newUrls) {
        await connection.execute("INSERT INTO imagenes (url, plantas_id, tipo) VALUES (?, ?, 'detail')", [url, result.insertId]);
      }
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findAllInventory(): Promise<PlantaInventario[]> {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        p.id,
        p.nombre,
        p.familia AS categoria,
        p.stock,
        p.habilitado,
        p.precio,
        COALESCE(p.discount, 0) AS discount,
        COALESCE(SUM(CASE WHEN o.id IS NOT NULL THEN d.cantidad ELSE 0 END), 0) AS ventas
      FROM plantas AS p
      LEFT JOIN orden_detalle AS d ON d.plantas_id = p.id
      LEFT JOIN ordenes AS o
        ON o.id = d.ordenes_id AND o.estado IN ('confirmado', 'entregado')
      GROUP BY p.id, p.nombre, p.familia, p.stock, p.habilitado, p.precio, p.discount
      ORDER BY p.nombre
    `);
    return rows.map((row) => ({
      id: Number(row.id),
      nombre: String(row.nombre),
      categoria: row.categoria === null ? null : String(row.categoria),
      stock: Number(row.stock),
      habilitado: Boolean(row.habilitado),
      precio: Number(row.precio),
      discount: Number(row.discount),
      ventas: Number(row.ventas),
    }));
  }

  async addStock(id: number, amount: number): Promise<Planta | null> {
    await pool.execute(
      "UPDATE plantas SET stock = stock + ?, actualizado = NOW() WHERE id = ?",
      [amount, id],
    );
    return this.findById(id);
  }

  async findDetailById(id: number): Promise<PlantaDetalle | null> {
    const [plantas] = await pool.execute<RowDataPacket[]>("SELECT * FROM `plantas` WHERE `id` = ?", [id]);
    const planta = plantas[0] as (Planta & { etiquetas: string[] | null }) | undefined;
    if (!planta) return null;

    const [imagenes] = await pool.execute<RowDataPacket[]>(
      "SELECT `id`, `url`, `tipo` FROM `imagenes` WHERE `plantas_id` = ? ORDER BY `id`",
      [id],
    );

    return {
      ...this.normalizePlant(planta),
      etiquetas: planta.etiquetas ?? (planta.etiqueta ? [planta.etiqueta] : []),
      imagenes: imagenes as ImagenDePlanta[],
    };
  }

  async findByFamily(familia: string): Promise<PlantaResumen[]> {
    const [plantas] = await pool.execute<RowDataPacket[]>(
      `SELECT
        p.\`id\`,
        p.\`stock\`,
        p.\`habilitado\`,
        p.\`nombre\` AS \`name\`,
        p.\`familia\` AS \`family\`,
        p.\`precio\` AS \`price\`,
        (
          SELECT i.\`url\`
          FROM \`imagenes\` AS i
          WHERE i.\`plantas_id\` = p.\`id\`
          ORDER BY i.\`id\`
          LIMIT 1
        ) AS \`image\`,
        COALESCE(p.\`discount\`, 0) AS \`discount\`,
        COALESCE(p.\`etiqueta\`, '') AS \`label\`,
        COALESCE(p.\`etiquetas\`, IF(COALESCE(p.\`etiqueta\`, '') = '', JSON_ARRAY(), JSON_ARRAY(p.\`etiqueta\`))) AS \`labels\`
      FROM \`plantas\` AS p
      WHERE (? = 'AllPlants' OR p.\`familia\` = ?)
      ORDER BY p.\`nombre\``,
      [familia, familia],
    );
    return plantas.map((plant) => ({ ...plant, stock: Number(plant.stock), habilitado: Boolean(plant.habilitado) })) as PlantaResumen[];
  }

  protected readonly table = "plantas";
  protected readonly fields = ["nombre", "familia", "precio", "discount", "stock", "habilitado", "etiqueta", "origen", "tipo", "iluminacion", "resistencia", "tamano", "cuidado", "petFriendly", "descripcion"] as const;
}

export default new PlantaModel();
