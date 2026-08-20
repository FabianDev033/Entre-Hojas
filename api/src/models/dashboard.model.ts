import type { RowDataPacket } from "mysql2";
import pool from "../config/database.js";
import monthlyStatisticsService from "../services/monthly-statistics.service.js";

const confirmedStatuses = ["confirmado", "entregado"] as const;

export interface DashboardSummaryOrders { pendiente: number; listo: number; enviado: number; confirmado: number; cancelado: number; }
export interface DashboardStockItem { id: number; nombre: string; stock: number; actualizado: Date; }
interface DashboardStockRow extends DashboardStockItem, RowDataPacket {}
export interface DashboardMonthlyStats { month: string; sales: number; orders: number; confirmedOrders: number; averageOrderValue: number; purchases: number; profit: number; }
export interface DashboardPerformanceItem { month: string; revenue: number; orders: number; sales: number; }
export interface DashboardData {
  salesTotal: number; salesPrev: number; orderTotal: number; orderPrev: number;
  averageOrderValue: number; averageOrderValuePrev: number; summaryOrders: DashboardSummaryOrders;
  stock: DashboardStockItem[]; purchasesTotal: number; purchasesPrev: number;
  history: DashboardMonthlyStats[]; performance: DashboardPerformanceItem[];
}

interface MonthStartRow extends RowDataPacket { currentMonthStart: string; }
interface SummaryOrdersRow extends RowDataPacket { pendiente: number | null; listo: number | null; enviado: number | null; confirmado: number | null; cancelado: number | null; }
interface CurrentMonthRow extends RowDataPacket { sales: number | null; orders: number | null; confirmedOrders: number | null; purchases: number | null; }
interface MonthlyStatisticRow extends RowDataPacket { month: string; sales: number | null; orders: number | null; confirmedOrders: number | null; averageOrderValue: number | null; purchases: number | null; profit: number | null; }

const toNumber = (value: number | null | undefined) => Number(value ?? 0);

class DashboardModel {
  async getDashboard(): Promise<DashboardData> {
    // Also catches up after downtime before historical data is displayed.
    await monthlyStatisticsService.captureCompletedMonths();
    const [monthRows] = await pool.query<MonthStartRow[]>("SELECT DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') AS currentMonthStart");
    const currentMonthStart = monthRows[0]?.currentMonthStart;
    if (!currentMonthStart) throw new Error("Unable to determine the current month.");

    const nextMonthStart = this.addMonths(currentMonthStart, 1);
    const firstHistoryMonth = this.addMonths(currentMonthStart, -3);
    const firstPerformanceMonth = this.addMonths(currentMonthStart, -5);
    const [[summaryRows], [stockRows], [currentRows], [savedRows]] = await Promise.all([
      pool.execute<SummaryOrdersRow[]>([
        "SELECT COALESCE(SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END), 0) AS pendiente,",
        "COALESCE(SUM(CASE WHEN estado = 'listo' THEN 1 ELSE 0 END), 0) AS listo,",
        "COALESCE(SUM(CASE WHEN estado = 'enviado' THEN 1 ELSE 0 END), 0) AS enviado,",
        "COALESCE(SUM(CASE WHEN estado IN (?, ?) THEN 1 ELSE 0 END), 0) AS confirmado,",
        "COALESCE(SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END), 0) AS cancelado",
        "FROM ordenes WHERE fecha >= ? AND fecha < ?",
      ].join(" "), [...confirmedStatuses, currentMonthStart, nextMonthStart]),
      pool.query<DashboardStockRow[]>("SELECT id, nombre, stock, actualizado FROM plantas WHERE actualizado IS NOT NULL ORDER BY actualizado DESC LIMIT 3"),
      pool.execute<CurrentMonthRow[]>([
        "SELECT order_statistics.sales, order_statistics.orders, order_statistics.confirmedOrders, purchase_statistics.purchases",
        "FROM (SELECT COALESCE(SUM(CASE WHEN estado IN (?, ?) THEN total ELSE 0 END), 0) AS sales,",
        "COUNT(*) AS orders, COALESCE(SUM(CASE WHEN estado IN (?, ?) THEN 1 ELSE 0 END), 0) AS confirmedOrders",
        "FROM ordenes WHERE fecha >= ? AND fecha < ?) AS order_statistics",
        "CROSS JOIN (SELECT COALESCE(SUM(total), 0) AS purchases FROM compras WHERE fecha >= ? AND fecha < ?) AS purchase_statistics",
      ].join(" "), [...confirmedStatuses, ...confirmedStatuses, currentMonthStart, nextMonthStart, currentMonthStart, nextMonthStart]),
      pool.execute<MonthlyStatisticRow[]>([
        "SELECT DATE_FORMAT(month, '%Y-%m') AS month, sales, orders, confirmed_orders AS confirmedOrders,",
        "average_order_value AS averageOrderValue, purchases, profit",
        "FROM monthly_statistics WHERE month >= ? AND month < ? ORDER BY month",
      ].join(" "), [firstPerformanceMonth, currentMonthStart]),
    ]);

    const summary = summaryRows[0];
    if (!summary) throw new Error("Unable to retrieve dashboard summary.");
    const current = this.toMonthlyStats(currentMonthStart.slice(0, 7), currentRows[0]);
    const savedByMonth = new Map(savedRows.map((row) => [row.month, this.toMonthlyStats(row.month, row)]));
    const history = this.buildMonths(firstHistoryMonth, 4, savedByMonth, current);
    const performance = this.buildPerformance(firstPerformanceMonth, savedByMonth, current);
    const previous = history[history.length - 2];
    if (!previous) throw new Error("Unable to retrieve dashboard history.");

    return {
      salesTotal: current.sales, salesPrev: this.percentageChange(current.sales, previous.sales),
      orderTotal: current.orders, orderPrev: this.percentageChange(current.orders, previous.orders),
      averageOrderValue: current.averageOrderValue, averageOrderValuePrev: this.percentageChange(current.averageOrderValue, previous.averageOrderValue),
      summaryOrders: { pendiente: toNumber(summary.pendiente), listo: toNumber(summary.listo), enviado: toNumber(summary.enviado), confirmado: toNumber(summary.confirmado), cancelado: toNumber(summary.cancelado) },
      stock: stockRows.map((plant) => ({ id: Number(plant.id), nombre: String(plant.nombre), stock: Number(plant.stock), actualizado: plant.actualizado })),
      purchasesTotal: current.purchases, purchasesPrev: previous.purchases, history, performance,
    };
  }

  private toMonthlyStats(month: string, row: (Pick<CurrentMonthRow, "sales" | "orders" | "confirmedOrders" | "purchases"> & Partial<MonthlyStatisticRow>) | undefined): DashboardMonthlyStats {
    const sales = toNumber(row?.sales); const purchases = toNumber(row?.purchases); const savedAverage = row?.averageOrderValue;
    return { month, sales, orders: toNumber(row?.orders), confirmedOrders: toNumber(row?.confirmedOrders), averageOrderValue: savedAverage === undefined || savedAverage === null ? this.average(sales, toNumber(row?.confirmedOrders)) : toNumber(savedAverage), purchases, profit: row?.profit === undefined || row.profit === null ? sales - purchases : toNumber(row.profit) };
  }

  private buildMonths(firstMonth: string, count: number, savedByMonth: Map<string, DashboardMonthlyStats>, current: DashboardMonthlyStats): DashboardMonthlyStats[] {
    return Array.from({ length: count }, (_, offset) => { const month = this.addMonths(firstMonth, offset).slice(0, 7); return month === current.month ? current : savedByMonth.get(month) ?? { month, sales: 0, orders: 0, confirmedOrders: 0, averageOrderValue: 0, purchases: 0, profit: 0 }; });
  }

  private buildPerformance(firstMonth: string, savedByMonth: Map<string, DashboardMonthlyStats>, current: DashboardMonthlyStats): DashboardPerformanceItem[] {
    return this.buildMonths(firstMonth, 6, savedByMonth, current).map((month) => ({ month: month.month, revenue: month.sales, orders: month.orders, sales: month.confirmedOrders }));
  }

  private average(total: number, orderCount: number): number { return orderCount === 0 ? 0 : this.round(total / orderCount, 2); }
  private percentageChange(current: number, previous: number): number { if (previous === 0) return current === 0 ? 0 : 100; return this.round(((current - previous) / previous) * 100, 1); }
  private addMonths(monthStart: string, months: number): string { const [year, month] = monthStart.slice(0, 7).split("-").map(Number); const date = new Date(Date.UTC(year, month - 1 + months, 1)); return String(date.getUTCFullYear()) + "-" + String(date.getUTCMonth() + 1).padStart(2, "0") + "-01"; }
  private round(value: number, decimals: number): number { const factor = 10 ** decimals; return Math.round((value + Number.EPSILON) * factor) / factor; }
}

export default new DashboardModel();
