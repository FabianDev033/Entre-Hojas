import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { BaseModel } from "./base.model.js";
import pool from "../config/database.js";
export interface Orden {
  id: number;
  fecha: string | null;
  estado: string | null;
  estadoActualizado: string | null;
  total: number;
  clientes_id: number;
}

export const orderStatuses = [
  "pendiente",
  "listo",
  "enviado",
  "confirmado",
  "cancelado",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];
export interface OrdenItemInput {
  plantId: number;
  quantity: number;
}
export interface OrdenCheckoutInput {
  items: OrdenItemInput[];
  customer: { nombre: string; telefono?: string; direccion: string };
}
export interface OrdenDetalleConsulta {
  plantId: number;
  nombre: string;
  familia: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
export interface OrdenConsulta extends Orden {
  direccion: string | null;
  cliente: { nombre: string; telefono: string | null };
  items: OrdenDetalleConsulta[];
}
interface OrdenJoinRow extends RowDataPacket {
  id: number;
  fecha: string | null;
  estado: string | null;
  estadoActualizado: string | null;
  total: number;
  clientes_id: number;
  cliente_nombre: string;
  cliente_telefono: string | null;
  direccion: string | null;
  plantId: number;
  planta_nombre: string;
  planta_familia: string | null;
  cantidad: number;
  precioUnitario: number;
}
class OrdenModel extends BaseModel<Orden> {
  protected readonly table = "ordenes";
  protected readonly fields = [
    "fecha",
    "estado",
    "total",
    "clientes_id",
  ] as const;

  async updateStatus(id: number, estado: OrderStatus): Promise<Orden | null> {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE ordenes SET estado = ?, estado_actualizado = NOW() WHERE id = ?",
      [estado, id],
    );
    if (result.affectedRows === 0) {
      return null;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, fecha, estado, estado_actualizado AS estadoActualizado, total, clientes_id FROM ordenes WHERE id = ?",
      [id],
    );
    return (rows[0] as Orden | undefined) ?? null;
  }

  async createFromCheckout(
    input: OrdenCheckoutInput,
  ): Promise<{ orderId: number }> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const items = Array.from(
        input.items.reduce((quantities, item) => {
          quantities.set(
            item.plantId,
            (quantities.get(item.plantId) ?? 0) + item.quantity,
          );
          return quantities;
        }, new Map<number, number>()),
      );
      let total = 0;
      const details: Array<{
        plantId: number;
        quantity: number;
        unitPrice: number;
      }> = [];
      for (const [plantId, quantity] of items) {
        const [rows] = await connection.execute<RowDataPacket[]>(
          ` SELECT id, precio, COALESCE(discount, 0) AS discount, stock FROM plantas WHERE id = ? FOR UPDATE `,
          [plantId],
        );
        const plant = rows[0] as
          | { id: number; precio: number; discount: number; stock: number }
          | undefined;
        if (!plant) {
          throw new Error("PLANT_NOT_FOUND");
        }
        if (plant.stock < quantity) {
          throw new Error("INSUFFICIENT_STOCK");
        }
        const unitPrice =
          Number(plant.precio) *
          (1 - Math.max(0, Number(plant.discount)) / 100);
        details.push({ plantId, quantity, unitPrice });
        total += unitPrice * quantity;
      }
      const [customerResult] = await connection.execute<ResultSetHeader>(
        ` INSERT INTO clientes (nombre, telefono, direccion) VALUES (?, ?, ?) `,
        [
          input.customer.nombre,
          input.customer.telefono ?? null,
          input.customer.direccion,
        ],
      );
      const [orderResult] = await connection.execute<ResultSetHeader>(
        ` INSERT INTO ordenes (fecha, estado, estado_actualizado, total, clientes_id) VALUES (NOW(), ?, NOW(), ?, ?) `,
        ["pendiente", total, customerResult.insertId],
      );
      for (const detail of details) {
        await connection.execute(
          ` INSERT INTO orden_detalle (plantas_id, ordenes_id, cantidad, \`precio unitario\`) VALUES (?, ?, ?, ?) `,
          [
            detail.plantId,
            orderResult.insertId,
            detail.quantity,
            detail.unitPrice,
          ],
        );
        await connection.execute(
          ` UPDATE plantas SET stock = stock - ? WHERE id = ? `,
          [detail.quantity, detail.plantId],
        );
      }
      await connection.commit();
      return { orderId: orderResult.insertId };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  /** * Obtiene todas las órdenes junto con: * - cliente * - teléfono * - dirección * - plantas * - familia * - cantidades * - precios * * Todo en una única consulta SQL. */ async findAllWithDetails(): Promise<
    OrdenConsulta[]
  > {
    const [rows] = await pool.execute<OrdenJoinRow[]>(
      ` SELECT o.id, o.fecha, o.estado, o.estado_actualizado AS estadoActualizado, o.total, o.clientes_id, c.nombre AS cliente_nombre, c.telefono AS cliente_telefono, c.direccion AS direccion, d.plantas_id AS plantId, d.cantidad AS cantidad, d.\`precio unitario\` AS precioUnitario, p.nombre AS planta_nombre, p.familia AS planta_familia FROM ordenes AS o INNER JOIN clientes AS c ON c.id = o.clientes_id INNER JOIN orden_detalle AS d ON d.ordenes_id = o.id INNER JOIN plantas AS p ON p.id = d.plantas_id ORDER BY o.fecha DESC, o.id DESC `,
    );
    const orders = new Map<number, OrdenConsulta>();
    for (const row of rows) {
      let order = orders.get(row.id);
      if (!order) {
        order = {
          id: Number(row.id),
          fecha: row.fecha,
          estado: row.estado,
          estadoActualizado: row.estadoActualizado,
          total: Number(row.total),
          clientes_id: Number(row.clientes_id),
          direccion: row.direccion,
          cliente: {
            nombre: row.cliente_nombre,
            telefono: row.cliente_telefono,
          },
          items: [],
        };
        orders.set(order.id, order);
      }
      const cantidad = Number(row.cantidad);
      const precioUnitario = Number(row.precioUnitario);
      order.items.push({
        plantId: Number(row.plantId),
        nombre: row.planta_nombre,
        familia: row.planta_familia,
        cantidad,
        precioUnitario,
        subtotal: cantidad * precioUnitario,
      });
    }
    return Array.from(orders.values());
  }
  async findOrderDetailById(id: number): Promise<OrdenConsulta | null> {
    const [rows] = await pool.execute<OrdenJoinRow[]>(
      ` SELECT o.id, o.fecha, o.estado, o.estado_actualizado AS estadoActualizado, o.total, o.clientes_id, c.nombre AS cliente_nombre, c.telefono AS cliente_telefono, c.direccion AS direccion, d.plantas_id AS plantId, d.cantidad AS cantidad, d.\`precio unitario\` AS precioUnitario, p.nombre AS planta_nombre, p.familia AS planta_familia FROM ordenes AS o INNER JOIN clientes AS c ON c.id = o.clientes_id INNER JOIN orden_detalle AS d ON d.ordenes_id = o.id INNER JOIN plantas AS p ON p.id = d.plantas_id WHERE o.id = ? ORDER BY d.plantas_id `,
      [id],
    );
    if (rows.length === 0) {
      return null;
    }
    const first = rows[0];
    const order: OrdenConsulta = {
      id: Number(first.id),
      fecha: first.fecha,
      estado: first.estado,
      estadoActualizado: first.estadoActualizado,
      total: Number(first.total),
      clientes_id: Number(first.clientes_id),
      direccion: first.direccion,
      cliente: {
        nombre: first.cliente_nombre,
        telefono: first.cliente_telefono,
      },
      items: [],
    };
    for (const row of rows) {
      const cantidad = Number(row.cantidad);
      const precioUnitario = Number(row.precioUnitario);
      order.items.push({
        plantId: Number(row.plantId),
        nombre: row.planta_nombre,
        familia: row.planta_familia,
        cantidad,
        precioUnitario,
        subtotal: cantidad * precioUnitario,
      });
    }
    return order;
  }
}
export default new OrdenModel();
