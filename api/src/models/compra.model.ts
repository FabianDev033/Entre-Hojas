import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/database.js";
import { HttpError } from "../utils/http-error.js";
import {
  purchaseStock,
  purchaseTotal,
  type PurchaseInput,
  type PurchaseItem,
} from "../utils/purchase-input.js";

export type Purchase = PurchaseInput & {
  id: number;
  total: number;
  anulada: boolean;
  stockAplicado: boolean;
  version: number;
};

class CompraModel {
  async findAll(from?: string, to?: string, id?: number): Promise<Purchase[]> {
    const conditions: string[] = [];
    const params: (number | string)[] = [];
    if (from) {
      conditions.push("c.fecha >= ?");
      params.push(from);
    }
    if (to) {
      conditions.push("c.fecha <= ?");
      params.push(to);
    }
    if (id) {
      conditions.push("c.id = ?");
      params.push(id);
    }
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT c.id, DATE_FORMAT(c.fecha, '%Y-%m-%d') AS fecha, c.proveedor,
        c.observaciones, c.total, c.anulada, c.stock_aplicado, c.version,
        d.id AS item_id, d.descripcion, d.tipo, d.cantidad,
        d.precio_unitario, d.planta_id, p.nombre AS planta_nombre,
        p.familia AS planta_familia
      FROM compras c LEFT JOIN compras_detalle d ON d.compra_id = c.id
      LEFT JOIN plantas p ON p.id = d.planta_id
      ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
      ORDER BY c.fecha DESC, c.id DESC, d.id ASC`,
      params,
    );
    const purchases = new Map<number, Purchase>();
    for (const row of rows) {
      if (!purchases.has(row.id))
        purchases.set(row.id, {
          id: row.id,
          fecha: row.fecha,
          proveedor: row.proveedor ?? "",
          observaciones: row.observaciones ?? "",
          total: Number(row.total),
          anulada: Boolean(row.anulada),
          stockAplicado: Boolean(row.stock_aplicado),
          version: Number(row.version),
          items: [],
        });
      if (row.item_id != null)
        purchases.get(row.id)!.items.push({
          descripcion:
            row.tipo === "planta" && row.planta_nombre
              ? row.planta_nombre
              : row.descripcion,
          plantaFamilia: row.planta_familia ?? null,
          tipo: row.tipo,
          cantidad: Number(row.cantidad),
          precioUnitario: Number(row.precio_unitario),
          plantaId: row.planta_id === null ? null : Number(row.planta_id),
        });
    }
    return [...purchases.values()];
  }

  async findById(id: number): Promise<Purchase> {
    const purchase = (await this.findAll(undefined, undefined, id))[0];
    if (!purchase) throw new HttpError(404, "No se encontró la compra.");
    return purchase;
  }

  async save(
    data: PurchaseInput | null,
    id?: number,
    version?: number,
  ): Promise<Purchase> {
    const connection = await pool.getConnection();
    let savedId = id;
    try {
      await connection.beginTransaction();
      let previous: PurchaseItem[] = [];
      let applyStock = true;
      const plantNames = new Map<number, string>();
      if (id) {
        const [rows] = await connection.execute<RowDataPacket[]>(
          "SELECT * FROM compras WHERE id = ? FOR UPDATE",
          [id],
        );
        const row = rows[0];
        if (!row) throw new HttpError(404, "No se encontró la compra.");
        if (row.anulada) throw new HttpError(409, "La compra ya está anulada.");
        if (Number(row.version) !== version)
          throw new HttpError(
            409,
            "La compra cambió en otra sesión. Recargá antes de continuar.",
          );
        applyStock = Boolean(row.stock_aplicado);
        const [details] = await connection.execute<RowDataPacket[]>(
          "SELECT * FROM compras_detalle WHERE compra_id = ? FOR UPDATE",
          [id],
        );
        previous = details.map((item) => ({
          descripcion: item.descripcion,
          tipo: item.tipo,
          cantidad: Number(item.cantidad),
          precioUnitario: Number(item.precio_unitario),
          plantaId: item.planta_id,
        }));
      }
      const before = purchaseStock(previous);
      const after = purchaseStock(data?.items ?? []);
      const ids = [...new Set([...before.keys(), ...after.keys()])].sort(
        (a, b) => a - b,
      );
      for (const plantId of ids) {
        const [plants] = await connection.execute<RowDataPacket[]>(
          "SELECT id, nombre, stock FROM plantas WHERE id = ? FOR UPDATE",
          [plantId],
        );
        if (!plants.length)
          throw new HttpError(
            400,
            "Una planta de la compra ya no existe. Revisá los ítems.",
          );
        plantNames.set(plantId, plants[0].nombre);
        if (applyStock) {
          const delta = (after.get(plantId) ?? 0) - (before.get(plantId) ?? 0);
          const stock = Number(plants[0].stock) + delta;
          if (stock < 0)
            throw new HttpError(
              409,
              "No se puede descontar el stock de esta compra: algunas unidades ya no están disponibles.",
            );
          if (stock > 2_147_483_647)
            throw new HttpError(
              400,
              "La compra supera el stock máximo permitido.",
            );
          if (delta)
            await connection.execute(
              "UPDATE plantas SET stock = ?, actualizado = NOW() WHERE id = ?",
              [stock, plantId],
            );
        }
      }
      if (!data) {
        await connection.execute(
          "UPDATE compras SET anulada = TRUE, version = version + 1 WHERE id = ?",
          [id!],
        );
      } else {
        if (id) {
          await connection.execute(
            "UPDATE compras SET fecha = ?, proveedor = ?, observaciones = ?, total = ?, version = version + 1 WHERE id = ?",
            [
              data.fecha,
              data.proveedor,
              data.observaciones,
              purchaseTotal(data.items),
              id,
            ],
          );
          await connection.execute(
            "DELETE FROM compras_detalle WHERE compra_id = ?",
            [id],
          );
        } else {
          const [result] = await connection.execute<ResultSetHeader>(
            "INSERT INTO compras (fecha, proveedor, observaciones, total, stock_aplicado) VALUES (?, ?, ?, ?, TRUE)",
            [
              data.fecha,
              data.proveedor,
              data.observaciones,
              purchaseTotal(data.items),
            ],
          );
          savedId = result.insertId;
        }
        for (const item of data.items)
          await connection.execute(
            "INSERT INTO compras_detalle (compra_id, descripcion, tipo, cantidad, precio_unitario, subtotal, planta_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
              savedId!,
              item.tipo === "planta"
                ? (plantNames.get(item.plantaId!) ?? item.descripcion)
                : item.descripcion,
              item.tipo,
              item.cantidad,
              item.precioUnitario,
              purchaseTotal([item]),
              item.plantaId,
            ],
          );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return this.findById(savedId!);
  }
}

export default new CompraModel();
