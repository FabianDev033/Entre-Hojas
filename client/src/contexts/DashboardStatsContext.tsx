import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type OrderSummary = {
  pendiente: number;
  listo: number;
  enviado: number;
  confirmado: number;
  cancelado: number;
};

export type StockUpdate = {
  id: number;
  nombre: string;
  stock: number;
  actualizado: string;
};

export type PerformanceItem = {
  month: string;
  revenue: number;
  sales: number;
  orders: number;
  confirmedOrders: number;
  averageOrderValue: number;
  purchases: number;
  profit: number;
};

export type DashboardHistoryItem = {
  month: string;
  sales: number;
  orders: number;
  confirmedOrders: number;
  averageOrderValue: number;
  purchases: number;
  profit: number;
};

export type MonthlyPerformanceStats = DashboardHistoryItem & {
  summaryOrders: OrderSummary;
};

export type DailyPerformanceStats = Omit<MonthlyPerformanceStats, "month"> & {
  day: number;
};

export type PerformanceComparisonStats = {
  current: MonthlyPerformanceStats;
  previous: MonthlyPerformanceStats;
  days: Array<{
    day: number;
    current: DailyPerformanceStats;
    previous: DailyPerformanceStats;
  }>;
};

export type MetricPeriod = {
  month: string;
  value: number;
};

type DashboardResponse = {
  salesTotal: number;
  salesPrev: number;
  orderTotal: number;
  orderPrev: number;
  averageOrderValue: number;
  averageOrderValuePrev: number;
  summaryOrders: OrderSummary;
  stock: StockUpdate[];
  purchasesTotal: number;
  purchasesPrev: number;
  history: DashboardHistoryItem[];
  performance: PerformanceItem[];
  performanceComparison: PerformanceComparisonStats;
};

export type SalesStats = {
  total: number;
  variation: number;
  history: MetricPeriod[];
};

export type OrderStats = {
  total: number;
  variation: number;
  history: MetricPeriod[];
};

export type AovStats = {
  total: number;
  variation: number;
  history: MetricPeriod[];
};

export type SummaryOrdersStats = OrderSummary & {
  total: number;
};

export type StockStats = {
  updates: StockUpdate[];
};

export type RevenueStats = {
  sales: number;
  purchases: number;
  profit: number;
  variation: number;
  history: Array<
    Pick<DashboardHistoryItem, "month" | "sales" | "purchases" | "profit">
  >;
};

export type PerformanceStats = {
  items: PerformanceItem[];
};

type DashboardStatsContextType = {
  salesStats: SalesStats | null;
  orderStats: OrderStats | null;
  aovStats: AovStats | null;
  summaryOrdersStats: SummaryOrdersStats | null;
  stockStats: StockStats | null;
  revenueStats: RevenueStats | null;
  performanceStats: PerformanceStats | null;
  performanceComparisonStats: PerformanceComparisonStats | null;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
};

const DashboardStatsContext = createContext<DashboardStatsContextType | null>(
  null,
);

const getDashboardStats = () =>
  axios.get<DashboardResponse>(`${API_BASE_URL}/api/dashboard`, {
    withCredentials: true,
  });

const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
};

export function DashboardStatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getDashboardStats();
      setStats(response.data);
    } catch {
      setError("No se pudieron cargar las estadísticas del dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadInitialStats = async () => {
      try {
        const response = await getDashboardStats();
        if (isActive) setStats(response.data);
      } catch {
        if (isActive)
          setError("No se pudieron cargar las estadísticas del dashboard.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadInitialStats();
    return () => {
      isActive = false;
    };
  }, []);

  const sections = useMemo(() => {
    if (!stats) {
      return {
        salesStats: null,
        orderStats: null,
        aovStats: null,
        summaryOrdersStats: null,
        stockStats: null,
        revenueStats: null,
        performanceStats: null,
        performanceComparisonStats: null,
      };
    }

    return {
      salesStats: {
        total: stats.salesTotal,
        variation: stats.salesPrev,
        history: stats.history.map(({ month, sales }) => ({
          month,
          value: sales,
        })),
      },
      orderStats: {
        total: stats.orderTotal,
        variation: stats.orderPrev,
        history: stats.history.map(({ month, orders }) => ({
          month,
          value: orders,
        })),
      },
      aovStats: {
        total: stats.averageOrderValue,
        variation: stats.averageOrderValuePrev,
        history: stats.history.map(({ month, averageOrderValue }) => ({
          month,
          value: averageOrderValue,
        })),
      },
      summaryOrdersStats: { total: stats.orderTotal, ...stats.summaryOrders },
      stockStats: { updates: stats.stock },
      revenueStats: {
        sales: stats.salesTotal,
        purchases: stats.purchasesTotal,
        profit: stats.salesTotal - stats.purchasesTotal,
        variation: calculatePercentageChange(
          stats.salesTotal - stats.purchasesTotal,
          stats.history.at(-2)?.profit ?? 0,
        ),
        history: stats.history.map(({ month, sales, purchases, profit }) => ({
          month,
          sales,
          purchases,
          profit,
        })),
      },
      performanceStats: { items: stats.performance },
      performanceComparisonStats: stats.performanceComparison,
    };
  }, [stats]);

  const value = useMemo(
    () => ({ ...sections, isLoading, error, refreshStats }),
    [sections, isLoading, error, refreshStats],
  );

  return (
    <DashboardStatsContext.Provider value={value}>
      {children}
    </DashboardStatsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDashboardStats() {
  const context = useContext(DashboardStatsContext);
  if (!context)
    throw new Error(
      "useDashboardStats must be used within a DashboardStatsProvider.",
    );
  return context;
}
