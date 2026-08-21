import { useState } from "react";
import { useDashboardStats } from "../../contexts/DashboardStatsContext";
import DashboardCharts from "./DashboardCharts";
const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const percentageFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 1,
});

const formatVariation = (value: number) =>
  `${value > 0 ? "+" : ""}${percentageFormatter.format(value)}%`;

export default function StatCard({
  metric,
}: {
  metric:
    | "sells"
    | "orders"
    | "AOV"
    | "sumOrders"
    | "stock"
    | "revenue"
    | "performance";
}) {
  const {
    salesStats,
    orderStats,
    aovStats,
    summaryOrdersStats,
    stockStats,
    revenueStats,
    performanceStats,
  } = useDashboardStats();

  const [performance, setPerformance] = useState<"comparison" | "complete">(
    "comparison",
  );
  const handleswitch = () => {
    performance === "comparison"
      ? setPerformance("complete")
      : setPerformance("comparison");
  };
  return (
    <div
      className={`w-full h-full bg-bg-light rounded-md shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)] flex flex-col justify-between px-3 py-2 text-black ${metric === "sumOrders" ? "col-start-3 row-start-2" : metric === "stock" ? "col-start-3 row-start-3" : metric === "revenue" ? "col-start-3 row-start-4" : metric === "performance" ? "col-span-2 row-span-3 col-start-1 row-start-2" : null}`}>
      {metric === "sells" && (
        <>
          <span className="text-xl font-Outfit font-light">Ventas</span>
          <div className="flex justify-between items-end h-full">
            <div className="flex flex-col gap-3 mb-2">
              <span className="text-4xl font-Manrope font-medium">
                {currencyFormatter.format(salesStats?.total ?? 0)}
              </span>
              <div className="flex gap-1 text-sm font-Manrope font-normal">
                <span className={`font-medium text-alt`}>
                  {formatVariation(salesStats?.variation ?? 0)}
                </span>
                <span>vs Ultimo mes</span>
              </div>
            </div>
            <div className="h-10/12 w-[30%] mr-5">
              <DashboardCharts metric="sales" />
            </div>
          </div>
        </>
      )}
      {metric === "orders" && (
        <>
          <span className="text-xl font-Outfit font-light">Ordenes</span>
          <div className="flex justify-between items-end h-full">
            <div className="flex flex-col gap-3 mb-2">
              <span className="text-4xl font-Manrope font-medium">
                {orderStats?.total ?? 0}
              </span>
              <div className="flex gap-1 text-sm font-Manrope font-normal">
                <span className={`font-medium text-alt`}>
                  {formatVariation(orderStats?.variation ?? 0)}
                </span>
                <span>vs Ultimo mes</span>
              </div>
            </div>
            <div className="h-10/12 w-[30%] mr-5">
              <DashboardCharts metric="orders" />
            </div>
          </div>
        </>
      )}
      {metric === "AOV" && (
        <>
          <span className="text-xl font-Outfit font-light">
            Valor ordenes promedio
          </span>
          <div className="flex justify-between items-end h-full">
            <div className="flex flex-col gap-3 mb-2">
              <span className="text-4xl font-Manrope font-medium">
                {currencyFormatter.format(aovStats?.total ?? 0)}
              </span>
              <div className="flex gap-1 text-sm font-Manrope font-normal">
                <span className={`font-medium text-alt`}>
                  {formatVariation(aovStats?.variation ?? 0)}
                </span>
                <span>vs Ultimo mes</span>
              </div>
            </div>
            <div className="h-10/12 w-[30%] mr-5">
              <DashboardCharts metric="aov" />
            </div>
          </div>
        </>
      )}
      {metric === "sumOrders" && (
        <>
          <span className="text-xl font-Outfit font-light">
            Resumen de órdenes
          </span>
          <div className="flex justify-around items-center my-auto mb-4">
            <div className="flex flex-col gap-3 items-center">
              <span className="font-Outfit font-extralight text-xl">
                {summaryOrdersStats?.total ?? 0}
              </span>
              <span className="font-Manrope font-light text-sm">Totales</span>
            </div>
            <div className="border-l border-black/60 h-full"></div>
            <div className="flex flex-col gap-3 items-center">
              <span className="font-Outfit font-extralight text-xl">
                {summaryOrdersStats?.confirmado ?? 0}
              </span>
              <span className="font-Manrope font-light text-sm">
                Confirmadas
              </span>
            </div>
            <div className="border-r border-black/60 h-full"></div>
            <div className="flex flex-col gap-3 items-center">
              <span className="font-Outfit font-extralight text-xl">
                {summaryOrdersStats?.cancelado ?? 0}
              </span>
              <span className="font-Manrope font-light text-sm">
                Canceladas
              </span>
            </div>
          </div>
        </>
      )}
      {metric === "stock" && (
        <>
          <span className="text-xl font-Outfit font-light">Stock</span>
          <div className="flex flex-col gap-3 font-Manrope font-light text-sm my-auto w-2/5">
            {stockStats?.updates.map((plant) => (
              <div
                className="flex gap-3 items-center justify-between"
                key={plant.id}>
                <span>{plant.nombre}</span>
                <span>{plant.stock}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {metric === "revenue" && (
        <>
          <span className="text-xl font-Outfit font-light">Ganancias</span>
          <div className="flex justify-between items-center h-full">
            <div className="flex flex-col gap-2 mb-2 self-end">
              <div className="flex flex-col gap-1 font-Manrope text-sm">
                <div className="flex justify-between w-full">
                  <span>Ventas: </span>
                  <span>
                    {currencyFormatter.format(revenueStats?.sales ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between w-full">
                  <span>Compras: </span>
                  <span>
                    {currencyFormatter.format(revenueStats?.purchases ?? 0)}
                  </span>
                </div>
              </div>
              <span className="text-4xl font-Manrope font-medium">
                {currencyFormatter.format(revenueStats?.profit ?? 0)}
              </span>
              <div className="flex gap-1 text-sm font-Manrope font-normal">
                <span className={`font-medium text-alt`}>
                  {formatVariation(revenueStats?.variation ?? 0)}
                </span>
                <span>vs Ultimo mes</span>
              </div>
            </div>
            <div className="h-10/12 w-[30%] mr-5">
              <DashboardCharts metric="revenue" />
            </div>
          </div>
        </>
      )}
      {metric === "performance" && (
        <>
          <div className="relative h-full text-black flex flex-col gap-3 font-Manrope font-normal">
            <span className="text-xl font-Outfit font-light">desempeño</span>
            <span className="text-3xl font-medium">
              {currencyFormatter.format(
                performanceStats?.items[performanceStats.items.length - 1]
                  ?.revenue ?? 0,
              )}
            </span>
            <div
              className="absolute right-2 top-2 cursor-pointer z-10"
              onClick={() => handleswitch()}>
              <div className="relative rounded-xl w-10 h-5 bg-alt-dark px-2 flex items-center">
                <div
                  className={`h-3 w-3 bg-bg-light rounded-full absolute left-1 transition-transform duration-300 ease-in-out ${
                    performance === "comparison"
                      ? "translate-x-0"
                      : "translate-x-5"
                  }`}
                />
              </div>
            </div>
            {performance === "comparison" ? (
              <>
                <div className="h-10/12">
                  <DashboardCharts metric="comparison" />
                </div>
                <div className="flex gap-3 items-center">
                  <span className="flex gap-2 items-center">
                    <div className="w-3 h-3 bg-alt rounded-full"></div>
                    Este Mes
                  </span>
                  <span className="flex gap-2 items-center">
                    <div className="w-3 h-3 bg-alt/30 rounded-full"></div>
                    Mes pasado
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="h-10/12">
                  <DashboardCharts metric="performance" />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
