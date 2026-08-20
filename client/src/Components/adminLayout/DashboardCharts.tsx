import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Rectangle,
  type BarShapeProps,
  YAxis,
  XAxis,
} from "recharts";
import { useDashboardStats } from "../../contexts/DashboardStatsContext";

export default function DashboardCharts({
  metric,
}: {
  metric: "sales" | "orders" | "aov" | "revenue" | "performance" | "comparison";
}) {
  const {
    salesStats,
    orderStats,
    aovStats,
    revenueStats,
    performanceComparisonStats,
    performanceStats,
  } = useDashboardStats();
  const salesChart = salesStats?.history;
  const orderChart = orderStats?.history;
  const aovChart = aovStats?.history;
  const revenueChart = revenueStats?.history.map(({ month, profit }) => ({
    month,
    value: profit,
  }));
  const performanceComparisonChart = performanceComparisonStats
    ? performanceComparisonStats.days.map(({ day, current, previous }) => ({
        day,
        current: current.sales,
        previous: previous.sales,
        currentDetails: current,
        previousDetails: previous,
      }))
    : [];
  const performanceChart = performanceStats?.items.map(
    ({
      month,
      sales,
      orders,
      confirmedOrders,
      averageOrderValue,
      purchases,
      profit,
    }) => ({
      month,
      sales,
      orders,
      confirmedOrders,
      averageOrderValue,
      purchases,
      profit,
    }),
  );
  const chartData = {
    sales: salesChart,
    orders: orderChart,
    aov: aovChart,
    revenue: revenueChart,
  };
  const ChartBar = (props: BarShapeProps) => {
    const isCurrent = props.index === (salesChart?.length ?? 0) - 1;

    return (
      <Rectangle
        {...props}
        fill={isCurrent ? "url(#salesGradientCurrent)" : "url(#salesGradient)"}
      />
    );
  };
  const currencyFormatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
  const numberFormatter = new Intl.NumberFormat("es-AR", {
    style: "decimal",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
  const formatCompactCurrency = (value: number) => {
    const absoluteValue = Math.abs(value);
    if (absoluteValue >= 1_000_000)
      return `$${(value / 1_000_000).toFixed(1).replace(".0", "")}M`;
    if (absoluteValue >= 1_000)
      return `$${(value / 1_000).toFixed(1).replace(".0", "")}k`;
    return `$${value}`;
  };
  function CustomTooltip({ payload, active }: any) {
    if (active && payload && payload.length) {
      if (metric === "performance") {
        const point = payload[0].payload;
        return (
          <div className="bg-bg rounded-md px-2 py-1 border border-black/70 flex flex-col gap-1 font-Manrope text-sm text-black shadow-[0px_4px_5px_0px_rgba(0,0,0,0.25)]">
            <span className="font-Outfit text-md mb-3 font-medium">
              {point.month}
            </span>
            <span>Ventas: {currencyFormatter.format(point.sales)}</span>
            <span>Órdenes: {numberFormatter.format(point.orders)}</span>
            <span>
              Confirmadas: {numberFormatter.format(point.confirmedOrders)}
            </span>
            <span>
              Promedio Orden:{" "}
              {currencyFormatter.format(point.averageOrderValue)}
            </span>
            <span>Compras: {numberFormatter.format(point.purchases)}</span>
            <span>Ganancias: {currencyFormatter.format(point.profit)}</span>
          </div>
        );
      }

      const currentDetails = payload[0].payload.currentDetails;
      const previousDetails = payload[0].payload.previousDetails;

      if (currentDetails && previousDetails) {
        return (
          <div className="bg-bg rounded-md px-2 py-1 border border-black/70 flex flex-col gap-3 text-black shadow-[0px_4px_5px_0px_rgba(0,0,0,0.25)]">
            <span className="font-Outfit text-md">
              Día {payload[0].payload.day}
            </span>
            <div className="font-Manrope text-sm flex flex-col gap-1">
              <span className="font-Outfit font-normal text-md">Este mes:</span>
              <span>
                Ventas: {currencyFormatter.format(currentDetails.sales)}
              </span>
              <span>Ordenes: {currentDetails.orders}</span>
              <span>Confirmadas: {currentDetails.confirmedOrders}</span>
              <span>
                Promedio Orden:{" "}
                {currencyFormatter.format(currentDetails.averageOrderValue)}
              </span>
              <span>Compras: {currentDetails.purchases}</span>
            </div>
            <div className="font-Manrope text-sm flex flex-col gap-1">
              <span className="font-Outfit font-normal text-md">
                Mes pasado:
              </span>
              <span>
                Ventas: {currencyFormatter.format(previousDetails.sales)}
              </span>
              <span>Ordenes: {previousDetails.orders}</span>
              <span>Confirmadas: {previousDetails.confirmedOrders}</span>
              <span>
                Promedio Orden:{" "}
                {currencyFormatter.format(previousDetails.averageOrderValue)}
              </span>
              <span>Compras: {previousDetails.purchases}</span>
            </div>
          </div>
        );
      }
      if (currentDetails) {
        return (
          <div className="bg-bg rounded-md px-2 py-1 border border-black/70 flex flex-col gap-3 text-black shadow-[0px_4px_5px_0px_rgba(0,0,0,0.25)]">
            <span className="font-Outfit text-md">
              Día {payload[0].payload.day}
            </span>
            <div className="font-Manrope text-sm flex flex-col gap-1">
              <span className="font-Outfit font-normal text-md">Este mes:</span>
              <span>
                Ventas: {currencyFormatter.format(currentDetails.sales)}
              </span>
              <span>Ordenes: {currentDetails.orders}</span>
              <span>Confirmadas: {currentDetails.confirmedOrders}</span>
              <span>
                Promedio Orden:{" "}
                {currencyFormatter.format(currentDetails.averageOrderValue)}
              </span>
              <span>Compras: {currentDetails.purchases}</span>
            </div>
          </div>
        );
      }

      return (
        <div className="bg-bg rounded-md px-2 py-1 border border-black/70 flex flex-col gap-3 text-black shadow-[0px_4px_5px_0px_rgba(0,0,0,0.25)]">
          <span className="font-Outfit text-md">{`${payload[0].payload.day ?? payload[0].payload.month}`}</span>
          <span className="font-Manrope text-md">{`${metric === "orders" ? numberFormatter.format(payload[0].value) : currencyFormatter.format(payload[0].value)}`}</span>
        </div>
      );
    }
    return null;
  }

  if (metric === "comparison") {
    return (
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart width={50} height={40} data={performanceComparisonChart}>
            <Tooltip content={CustomTooltip} />
            <YAxis
              axisLine={false}
              tickCount={8}
              tickFormatter={formatCompactCurrency}
              fontFamily="Manrope"
              fontSize={15}
              tick={{ fill: "#7E7C78" }}
            />
            <CartesianGrid strokeDasharray="5 10" vertical={false} />
            <Line
              dataKey="current"
              name="Este mes"
              stroke="#915E99"
              fill="#915E99"
              strokeWidth={1.5}
            />
            <Line
              dataKey="previous"
              name="Mes anterior"
              stroke="#D7C5D0"
              fill="#D7C5D0"
              strokeWidth={1.5}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (metric === "performance") {
    return (
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart width={50} height={40} data={performanceChart}>
            <Tooltip content={CustomTooltip} />
            <YAxis
              axisLine={false}
              tickCount={8}
              tickFormatter={formatCompactCurrency}
              fontFamily="Manrope"
              fontSize={15}
              tick={{ fill: "#7E7C78" }}
            />
            <XAxis
              axisLine={false}
              dataKey="month"
              fontFamily="Manrope"
              fontSize={10}
              angle={-30}
              textAnchor="end"
              height={50}
              padding={{ left: 0, right: 5 }}
              tick={{ fill: "#7E7C78" }}
            />
            <CartesianGrid strokeDasharray="5 10" vertical={false} />
            <Line
              dataKey="sales"
              name="Este mes"
              stroke="#915E99"
              fill="#915E99"
              strokeWidth={1.5}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={50} height={40} data={chartData[metric]}>
          <Tooltip content={CustomTooltip} />
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#BC9DBB" stopOpacity={1} />
              <stop offset="60%" stopColor="#BC9DBB" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#F5F1E8" stopOpacity={0.8} />
            </linearGradient>

            <linearGradient
              id="salesGradientCurrent"
              x1="0"
              y1="0"
              x2="0"
              y2="1">
              <stop offset="0%" stopColor="#915E99" stopOpacity={1} />
              <stop offset="60%" stopColor="#915E99" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#F5F1E8" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <Bar dataKey="value" shape={ChartBar} radius={[3, 3, 0, 0]}></Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
