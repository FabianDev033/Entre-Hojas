import { BaseModel } from "./base.model.js";
import type { RowDataPacket } from "mysql2";
import pool from "../config/database.js";

export interface Planta {
  id: number; nombre: string; familia: string | null; precio: number; discount: number; stock: number;
  etiqueta: string | null; origen: string | null; tipo: string | null; iluminacion: string | null;
  resistencia: string | null; tamano: string | null; cuidado: string | null; descripcion: string | null;
}

export interface ImagenDePlanta {
  id: number;
  url: string;
  tipo: string;
}

export interface PlantaDetalle extends Planta {
  imagenes: ImagenDePlanta[];
}

export interface PlantaResumen {
  id: number;
  name: string;
  price: number;
  image: string | null;
  discount: number;
  label: string;
}

export interface PlantaInventario {
  id: number;
  nombre: string;
  categoria: string | null;
  stock: number;
  precio: number;
  discount: number;
  ventas: number;
}

class PlantaModel extends BaseModel<Planta> {
  async findAllInventory(): Promise<PlantaInventario[]> {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        p.id,
        p.nombre,
        p.familia AS categoria,
        p.stock,
        p.precio,
        COALESCE(p.discount, 0) AS discount,
        COALESCE(SUM(CASE WHEN o.id IS NOT NULL THEN d.cantidad ELSE 0 END), 0) AS ventas
      FROM plantas AS p
      LEFT JOIN orden_detalle AS d ON d.plantas_id = p.id
      LEFT JOIN ordenes AS o
        ON o.id = d.ordenes_id AND o.estado IN ('confirmado', 'entregado')
      GROUP BY p.id, p.nombre, p.familia, p.stock, p.precio, p.discount
      ORDER BY p.nombre
    `);
    return rows.map((row) => ({
      id: Number(row.id),
      nombre: String(row.nombre),
      categoria: row.categoria === null ? null : String(row.categoria),
      stock: Number(row.stock),
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
    const planta = plantas[0] as Planta | undefined;
    if (!planta) return null;

    const [imagenes] = await pool.execute<RowDataPacket[]>(
      "SELECT `id`, `url`, `tipo` FROM `imagenes` WHERE `plantas_id` = ? ORDER BY `id`",
      [id],
    );

    return { ...planta, imagenes: imagenes as ImagenDePlanta[] };
  }

  async findByFamily(familia: string): Promise<PlantaResumen[]> {
    const [plantas] = await pool.execute<RowDataPacket[]>(
      `SELECT
        p.\`id\`,
        p.\`nombre\` AS \`name\`,
        p.\`precio\` AS \`price\`,
        (
          SELECT i.\`url\`
          FROM \`imagenes\` AS i
          WHERE i.\`plantas_id\` = p.\`id\`
          ORDER BY i.\`id\`
          LIMIT 1
        ) AS \`image\`,
        COALESCE(p.\`discount\`, 0) AS \`discount\`,
        COALESCE(p.\`etiqueta\`, '') AS \`label\`
      FROM \`plantas\` AS p
      WHERE (? = 'AllPlants' OR p.\`familia\` = ?)
      ORDER BY p.\`nombre\``,
      [familia, familia],
    );
    return plantas as PlantaResumen[];
  }

  protected readonly table = "plantas";
  protected readonly fields = ["nombre", "familia", "precio", "discount", "stock", "etiqueta", "origen", "tipo", "iluminacion", "resistencia", "tamano", "cuidado", "descripcion"] as const;
}

export default new PlantaModel();
