import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { BaseModel } from "./base.model.js";
import pool from "../config/database.js";

export interface Orden { id: number; fecha: string | null; estado: string | null; total: number; clientes_id: number; }

export interface OrdenItemInput {
  plantId: number;
  quantity: number;
}

export interface OrdenCheckoutInput {
  items: OrdenItemInput[];
  customer: {
    nombre: string;
    telefono?: string;
    direccion: string;
  };
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

class OrdenModel extends BaseModel<Orden> {
  protected readonly table = "ordenes";
  protected readonly fields = ["fecha", "estado", "total", "clientes_id"] as const;

  async createFromCheckout(input: OrdenCheckoutInput): Promise<{ orderId: number }> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const items = Array.from(
        input.items.reduce((quantities, item) => {
          quantities.set(item.plantId, (quantities.get(item.plantId) ?? 0) + item.quantity);
          return quantities;
        }, new Map<number, number>()),
      );

      let total = 0;
      const details: Array<{ plantId: number; quantity: number; unitPrice: number }> = [];

      for (const [plantId, quantity] of items) {
        const [rows] = await connection.execute<RowDataPacket[]>(
          "SELECT `id`, `precio`, COALESCE(`discount`, 0) AS `discount`, `stock` FROM `plantas` WHERE `id` = ? FOR UPDATE",
          [plantId],
        );
        const plant = rows[0] as { id: number; precio: number; discount: number; stock: number } | undefined;
        if (!plant) throw new Error("PLANT_NOT_FOUND");
        if (plant.stock < quantity) throw new Error("INSUFFICIENT_STOCK");

        const unitPrice = Number(plant.precio) * (1 - Math.max(0, Number(plant.discount)) / 100);
        details.push({ plantId, quantity, unitPrice });
        total += unitPrice * quantity;
      }

      const [customerResult] = await connection.execute<ResultSetHeader>(
        "INSERT INTO `clientes` (`nombre`, `telefono`, `direccion`) VALUES (?, ?, ?)",
        [input.customer.nombre, input.customer.telefono ?? null, input.customer.direccion],
      );
      const [orderResult] = await connection.execute<ResultSetHeader>(
        "INSERT INTO `ordenes` (`fecha`, `estado`, `total`, `clientes_id`) VALUES (NOW(), ?, ?, ?)",
        ["En espera de pago", total, customerResult.insertId],
      );

      for (const detail of details) {
        await connection.execute(
          "INSERT INTO `orden_detalle` (`plantas_id`, `ordenes_id`, `cantidad`, `precio unitario`) VALUES (?, ?, ?, ?)",
          [detail.plantId, orderResult.insertId, detail.quantity, detail.unitPrice],
        );
        await connection.execute(
          "UPDATE `plantas` SET `stock` = `stock` - ? WHERE `id` = ?",
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

  async findOrderDetailById(id: number): Promise<OrdenConsulta | null> {
    const [orders] = await pool.execute<RowDataPacket[]>(
      `SELECT o.\`id\`, o.\`fecha\`, o.\`estado\`, o.\`total\`, o.\`clientes_id\`,
        c.\`direccion\`, c.\`nombre\` AS \`cliente_nombre\`, c.\`telefono\` AS \`cliente_telefono\`
       FROM \`ordenes\` AS o
       INNER JOIN \`clientes\` AS c ON c.\`id\` = o.\`clientes_id\`
       WHERE o.\`id\` = ?`,
      [id],
    );
    const order = orders[0] as (Orden & { direccion: string | null; cliente_nombre: string; cliente_telefono: string | null }) | undefined;
    if (!order) return null;

    const [items] = await pool.execute<RowDataPacket[]>(
      `SELECT d.\`plantas_id\` AS \`plantId\`, p.\`nombre\`, p.\`familia\`,
        d.\`cantidad\` AS \`cantidad\`, d.\`precio unitario\` AS \`precioUnitario\`
       FROM \`orden_detalle\` AS d
       INNER JOIN \`plantas\` AS p ON p.\`id\` = d.\`plantas_id\`
       WHERE d.\`ordenes_id\` = ?`,
      [id],
    );

    return {
      id: order.id,
      fecha: order.fecha,
      estado: order.estado,
      total: Number(order.total),
      clientes_id: order.clientes_id,
      direccion: order.direccion,
      cliente: { nombre: order.cliente_nombre, telefono: order.cliente_telefono },
      items: items.map((item) => {
        const cantidad = Number(item.cantidad);
        const precioUnitario = Number(item.precioUnitario);
        return {
          plantId: Number(item.plantId),
          nombre: String(item.nombre),
          familia: item.familia as string | null,
          cantidad,
          precioUnitario,
          subtotal: cantidad * precioUnitario,
        };
      }),
    };
  }
}

export default new OrdenModel();
