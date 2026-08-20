import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/database.js";

// "entregado" remains in historical records and is equivalent to "confirmado".
const confirmedStatuses = ["confirmado", "entregado"] as const;

interface MonthRow extends RowDataPacket {
  month: string | null;
}

class MonthlyStatisticsModel {
  /** Saves each completed month once, leaving closed data immutable. */
  async captureCompletedMonths(): Promise<void> {
    const [[currentMonthRows], [firstMonthRows]] = await Promise.all([
      pool.query<MonthRow[]>("SELECT DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') AS month"),
      pool.query<MonthRow[]>([
        "SELECT DATE_FORMAT(MIN(fecha), '%Y-%m-01') AS month",
        "FROM (",
        "  SELECT fecha FROM ordenes WHERE fecha IS NOT NULL",
        "  UNION ALL",
        "  SELECT fecha FROM compras",
        ") AS activity",
      ].join(" ")),
    ]);

    const currentMonth = currentMonthRows[0]?.month;
    const firstMonth = firstMonthRows[0]?.month;
    if (!currentMonth || !firstMonth) return;

    for (let month = firstMonth; month < currentMonth; month = this.addMonths(month, 1)) {
      await this.captureMonth(month);
    }
  }

  private async captureMonth(month: string): Promise<void> {
    const nextMonth = this.addMonths(month, 1);
    const sql = [
      "INSERT IGNORE INTO monthly_statistics (",
      "  month, sales, orders, confirmed_orders, average_order_value, purchases, profit,",
      "  pending_orders, ready_orders, shipped_orders, cancelled_orders",
      ")",
      "SELECT",
      "  ?, order_statistics.sales, order_statistics.orders, order_statistics.confirmed_orders,",
      "  CASE WHEN order_statistics.confirmed_orders = 0 THEN 0",
      "       ELSE ROUND(order_statistics.sales / order_statistics.confirmed_orders, 2) END,",
      "  purchase_statistics.purchases,",
      "  order_statistics.sales - purchase_statistics.purchases,",
      "  order_statistics.pending_orders, order_statistics.ready_orders,",
      "  order_statistics.shipped_orders, order_statistics.cancelled_orders",
      "FROM (",
      "  SELECT",
      "    COALESCE(SUM(CASE WHEN estado IN (?, ?) THEN total ELSE 0 END), 0) AS sales,",
      "    COUNT(*) AS orders,",
      "    COALESCE(SUM(CASE WHEN estado IN (?, ?) THEN 1 ELSE 0 END), 0) AS confirmed_orders,",
      "    COALESCE(SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END), 0) AS pending_orders,",
      "    COALESCE(SUM(CASE WHEN estado = 'listo' THEN 1 ELSE 0 END), 0) AS ready_orders,",
      "    COALESCE(SUM(CASE WHEN estado = 'enviado' THEN 1 ELSE 0 END), 0) AS shipped_orders,",
      "    COALESCE(SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END), 0) AS cancelled_orders",
      "  FROM ordenes WHERE fecha >= ? AND fecha < ?",
      ") AS order_statistics",
      "CROSS JOIN (",
      "  SELECT COALESCE(SUM(total), 0) AS purchases",
      "  FROM compras WHERE fecha >= ? AND fecha < ?",
      ") AS purchase_statistics",
    ].join(" ");

    await pool.execute<ResultSetHeader>(sql, [
      month, ...confirmedStatuses, ...confirmedStatuses, month, nextMonth, month, nextMonth,
    ]);
  }

  private addMonths(monthStart: string, months: number): string {
    const [year, month] = monthStart.slice(0, 7).split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1 + months, 1));
    return String(date.getUTCFullYear()) + "-" + String(date.getUTCMonth() + 1).padStart(2, "0") + "-01";
  }
}

export default new MonthlyStatisticsModel();
