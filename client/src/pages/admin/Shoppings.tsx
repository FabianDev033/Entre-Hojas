import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MiniAdd,
  Arrow2,
  Calendar,
  Pen,
  Search,
  Trash,
} from "../../assets/icons";
import { useDashboardStats } from "../../contexts/DashboardStatsContext";
import {
  itemSubtotal,
  purchaseDate,
  purchaseError,
  purchaseMoney,
  purchasesApi,
  purchaseTypes,
  todayDate,
  type Purchase,
} from "../../utils/purchases";

type Period = "month" | "previous" | "all" | "custom";
const inputClass =
  "rounded-sm border border-black/40 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-alt/40";

function monthRange(previous = false) {
  const [year, month] = todayDate().split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1 - Number(previous), 1));
  const end = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0),
  );
  return {
    desde: start.toISOString().slice(0, 10),
    hasta: end.toISOString().slice(0, 10),
  };
}

export default function Shoppings() {
  const location = useLocation();
  const navigation = location.state as {
    message?: string;
    fecha?: string;
  } | null;
  const { refreshStats } = useDashboardStats();
  const [period, setPeriod] = useState<Period>(() =>
    navigation?.fecha &&
    navigation.fecha.slice(0, 7) !== todayDate().slice(0, 7)
      ? "custom"
      : "month",
  );
  const [customFrom, setCustomFrom] = useState(
    navigation?.fecha ?? monthRange().desde,
  );
  const [customTo, setCustomTo] = useState(
    navigation?.fecha ?? monthRange().hasta,
  );
  const [search, setSearch] = useState("");
  const [includeCancelled, setIncludeCancelled] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState(navigation?.message ?? "");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [target, setTarget] = useState<Purchase | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const range: { desde?: string; hasta?: string } =
    period === "all"
      ? {}
      : period === "custom"
        ? { desde: customFrom, hasta: customTo }
        : monthRange(period === "previous");
  const { desde, hasta } = range;
  const validRange =
    period !== "custom" || Boolean(desde && hasta && desde <= hasta);

  useEffect(() => {
    if (!validRange) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await purchasesApi.get<Purchase[]>("/compras", {
          params: { desde, hasta },
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setPurchases(data);
      } catch (loadError) {
        if (!controller.signal.aborted)
          setError(
            purchaseError(loadError, "No se pudieron cargar las compras."),
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [desde, hasta, validRange, attempt]);

  const active = purchases.filter((purchase) => !purchase.anulada);
  const total =
    active.reduce(
      (sum, purchase) => sum + Math.round(purchase.total * 100),
      0,
    ) / 100;
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es");
  const query = normalize(search.trim());
  const visible = purchases.filter(
    (purchase) =>
      (includeCancelled || !purchase.anulada) &&
      normalize(
        [
          purchase.id,
          purchase.proveedor,
          purchase.observaciones,
          ...purchase.items.flatMap((item) => [
            item.descripcion,
            item.plantaFamilia ?? "",
          ]),
        ].join(" "),
      ).includes(query),
  );
  const periodLabel =
    period === "month"
      ? "Este mes"
      : period === "previous"
        ? "Mes pasado"
        : period === "all"
          ? "Todo el historial"
          : `${purchaseDate(customFrom)} al ${purchaseDate(customTo)}`;
  const ready = !loading && !error && validRange;
  const askCancel = (purchase: Purchase) => {
    setTarget(purchase);
    setCancelError(null);
    dialog.current?.showModal();
  };
  const cancelPurchase = async () => {
    if (!target || cancelling) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const { data } = await purchasesApi.post<Purchase>(
        `/compras/${target.id}/anular`,
        { version: target.version },
      );
      setPurchases((current) =>
        current.map((purchase) => (purchase.id === data.id ? data : purchase)),
      );
      setMessage(`Compra #${data.id} anulada.`);
      void refreshStats();
      dialog.current?.close();
    } catch (cancelFailure) {
      setCancelError(
        purchaseError(cancelFailure, "No se pudo anular la compra."),
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <main className="h-svh overflow-y-auto overscroll-y-contain bg-bg-dark px-6 py-5 font-Manrope text-black">
      <div className="w-full max-w-11/12">
        <header className="mb-5">
          <h1 className="font-Outfit text-3xl font-medium">Compras</h1>
        </header>
        <section
          aria-label="Resumen del período"
          className="mb-8 grid max-w-4xl gap-5 sm:grid-cols-2">
          <article className="rounded-md bg-bg-light px-4 py-3 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)]">
            <h2 className="font-Outfit text-xl font-light">Total comprado</h2>
            <p className="my-4 break-words text-4xl font-medium tabular-nums">
              {ready ? purchaseMoney(total) : "—"}
            </p>
            <p className="text-sm text-black/70">{periodLabel}</p>
          </article>
          <article className="rounded-md bg-bg-light px-4 py-3 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)]">
            <h2 className="font-Outfit text-xl font-light">
              Compras registradas
            </h2>
            <p className="my-4 text-4xl font-medium tabular-nums">
              {ready ? active.length : "—"}
            </p>
            <p className="text-sm text-black/70">
              Compras vigentes del período
            </p>
          </article>
        </section>
        <section aria-label="Listado de compras" className="w-full">
          <div className="mb-5 flex flex-wrap items-center gap-4">
            <label className="relative flex min-w-0 flex-1 items-center sm:max-w-sm">
              <Search aria-hidden="true" className="absolute left-3 h-5 w-5" />
              <input
                aria-label="Buscar compras"
                type="search"
                placeholder="Buscar proveedor, resumen o ítem"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={`${inputClass} w-full py-3 pl-11 rounded-md`}
              />
            </label>
            <Link
              to="/admin/Compras/nueva"
              className="flex items-center gap-2 rounded-xl bg-alt-dark px-4 py-2.5 font-Outfit font-light text-lg text-white shadow-sm">
              <MiniAdd className="h-5 w-5" />
              Nueva compra
            </Link>
            <label className="flex items-center gap-2 sm:ml-auto">
              <Calendar aria-hidden="true" className="h-5 w-5" />
              <select
                aria-label="Período de compras"
                value={period}
                onChange={(event) => setPeriod(event.target.value as Period)}
                className={`${inputClass} cursor-pointer`}>
                <option value="month">Este mes</option>
                <option value="previous">Mes pasado</option>
                <option value="all">Todo el historial</option>
                <option value="custom">Personalizado</option>
              </select>
            </label>
          </div>
          {period === "custom" && (
            <div className="mb-4 flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-sm">
                Desde
                <input
                  type="date"
                  min="1000-01-01"
                  max="9999-12-31"
                  value={customFrom}
                  onChange={(event) => setCustomFrom(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Hasta
                <input
                  type="date"
                  min="1000-01-01"
                  max="9999-12-31"
                  value={customTo}
                  onChange={(event) => setCustomTo(event.target.value)}
                  className={inputClass}
                />
              </label>
              {!validRange && (
                <p role="alert" className="text-sm text-cancel">
                  Elegí un rango válido: desde debe ser anterior o igual a
                  hasta.
                </p>
              )}
            </div>
          )}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-black/60">
              Las tarjetas resumen el período completo y excluyen las compras
              anuladas.
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCancelled}
                onChange={(event) => setIncludeCancelled(event.target.checked)}
                className="accent-alt-dark"
              />
              Mostrar anuladas
            </label>
          </div>
          {message && (
            <p role="status" className="mb-4 text-sm text-primary-dark">
              {message}
            </p>
          )}
          {loading && validRange ? (
            <p role="status" className="py-8">
              Cargando compras...
            </p>
          ) : error ? (
            <div role="alert" className="py-6">
              <p className="text-cancel">{error}</p>
              <button
                type="button"
                onClick={() => setAttempt((value) => value + 1)}
                className="mt-3 text-alt-dark underline cursor-pointer">
                Reintentar
              </button>
            </div>
          ) : (
            validRange && (
              <>
                <div
                  className="hidden grid-cols-[9rem_1.4fr_2fr_10rem_1.5rem] gap-4 border-b border-black/20 px-4 py-3 font-Outfit text-lg lg:grid"
                  aria-hidden="true">
                  <span>Fecha</span>
                  <span>Proveedor</span>
                  <span>Resumen</span>
                  <span className="text-right">Monto</span>
                  <span />
                </div>
                {visible.length === 0 ? (
                  <div className="rounded-sm bg-bg-light/60 px-5 py-10 text-center">
                    <h2 className="font-Outfit text-xl">
                      {search.trim()
                        ? "No hay compras que coincidan"
                        : "No hay compras en este período"}
                    </h2>
                    <p className="mt-2 text-sm text-black/60">
                      {search.trim()
                        ? "Probá con otro proveedor, resumen o producto."
                        : "Registrá una nueva compra o elegí otro período."}
                    </p>
                  </div>
                ) : (
                  visible.map((purchase) => (
                    <article
                      key={purchase.id}
                      className={`border-b border-black/25 ${expanded === purchase.id ? "bg-bg-light/80 shadow-sm" : ""}`}>
                      <h2>
                        <button
                          type="button"
                          aria-expanded={expanded === purchase.id}
                          aria-controls={`purchase-${purchase.id}`}
                          onClick={() =>
                            setExpanded((current) =>
                              current === purchase.id ? null : purchase.id,
                            )
                          }
                          className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-5 text-left cursor-pointer hover:bg-bg-light/50 focus-visible:outline-2 focus-visible:outline-alt lg:grid-cols-[9rem_1.4fr_2fr_10rem_1.5rem] lg:gap-4">
                          <span className="text-sm text-black/70 lg:text-base">
                            {purchaseDate(purchase.fecha)}
                          </span>
                          <span className="col-start-1 break-words font-medium lg:col-auto lg:font-normal">
                            {purchase.proveedor || "Sin proveedor"}
                          </span>
                          <span className="col-start-1 min-w-0 break-words text-sm lg:col-auto lg:text-base">
                            {purchase.observaciones || `Compra #${purchase.id}`}
                            {purchase.anulada && (
                              <span className="ml-2 inline-block rounded-sm bg-cancel/10 px-2 py-0.5 text-xs text-cancel">
                                Anulada
                              </span>
                            )}
                          </span>
                          <span
                            className={`col-start-2 row-start-2 whitespace-nowrap text-right tabular-nums lg:col-auto lg:row-auto ${purchase.anulada ? "text-black/50 line-through" : ""}`}>
                            {purchaseMoney(purchase.total)}
                          </span>
                          <Arrow2
                            aria-hidden="true"
                            className={`col-start-2 row-start-1 justify-self-end transition-transform lg:col-auto lg:row-auto ${expanded === purchase.id ? "rotate-90" : ""}`}
                          />
                        </button>
                      </h2>
                      {expanded === purchase.id && (
                        <div
                          id={`purchase-${purchase.id}`}
                          className="px-4 pb-4">
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-160 text-left text-sm">
                              <caption className="sr-only">
                                Detalle de la compra #{purchase.id}
                              </caption>
                              <thead className="border border-black/40 bg-bg-light font-Outfit text-base">
                                <tr>
                                  <th
                                    scope="col"
                                    className="px-3 py-2 font-normal">
                                    Producto / insumo
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-3 py-2 font-normal">
                                    Tipo
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-3 py-2 text-right font-normal">
                                    Cantidad
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-3 py-2 text-right font-normal">
                                    Precio unitario
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-3 py-2 text-right font-normal">
                                    Subtotal
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {purchase.items.map((item, index) => (
                                  <tr
                                    key={index}
                                    className="border-b border-black/5">
                                    <td className="px-3 py-4 flex gap-1">
                                      <div>{item.plantaFamilia}</div>
                                      <div>{item.descripcion}</div>
                                    </td>
                                    <td className="px-3 py-4">
                                      {purchaseTypes.find(
                                        (type) => type.value === item.tipo,
                                      )?.label ?? item.tipo}
                                    </td>
                                    <td className="px-3 py-4 text-right tabular-nums">
                                      {item.cantidad}
                                    </td>
                                    <td className="px-3 py-4 text-right whitespace-nowrap tabular-nums">
                                      {purchaseMoney(item.precioUnitario)}
                                    </td>
                                    <td className="px-3 py-4 text-right whitespace-nowrap tabular-nums">
                                      {purchaseMoney(itemSubtotal(item))}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {purchase.items.length === 0 && (
                            <p className="py-4 text-sm text-black/60">
                              Esta compra no tiene ítems detallados.
                            </p>
                          )}
                          <p className="mt-3 text-xs text-black/60">
                            {purchase.stockAplicado
                              ? purchase.anulada
                                ? "Movimiento de stock revertido al anular la compra."
                                : "Las plantas de esta compra ingresaron al stock automáticamente."
                              : "Compra anterior al stock automático. Su edición o anulación no modifica el inventario."}
                          </p>
                          {!purchase.anulada && (
                            <div className="mt-4 flex flex-wrap gap-3">
                              <Link
                                to={`/admin/Compras/${purchase.id}/editar`}
                                className="flex items-center gap-2 rounded-md border border-alt-dark bg-bg-light px-3 py-1.5 text-sm shadow-sm">
                                <Pen className="h-4 w-4" />
                                Editar compra
                              </Link>
                              <button
                                type="button"
                                onClick={() => askCancel(purchase)}
                                className="flex items-center gap-2 rounded-md bg-cancel px-3 py-1.5 text-sm text-white shadow-sm cursor-pointer">
                                <Trash className="h-4 w-4 color-white" />
                                Anular compra
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  ))
                )}
              </>
            )
          )}
        </section>
      </div>
      <dialog
        ref={dialog}
        aria-labelledby="cancel-purchase-title"
        onCancel={(event) => {
          if (cancelling) event.preventDefault();
        }}
        className="fixed inset-0 m-auto w-[min(92vw,30rem)] rounded-md bg-bg-light p-6 text-black shadow-xl backdrop:bg-black/40">
        <h2 id="cancel-purchase-title" className="font-Outfit text-2xl">
          Anular compra #{target?.id}
        </h2>
        <p className="mt-3 text-sm">
          La compra se conservará en el historial y dejará de contar en el total
          comprado.
          {target?.stockAplicado
            ? " Se descontarán del stock las plantas ingresadas. Si no hay unidades suficientes, la operación se cancelará."
            : " Esta compra es anterior al stock automático; el inventario no se modificará."}
        </p>
        {cancelError && (
          <p role="alert" className="mt-3 text-sm text-cancel">
            {cancelError}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            type="button"
            disabled={cancelling}
            onClick={() => void cancelPurchase()}
            className="rounded-sm bg-cancel px-4 py-2 text-white cursor-pointer disabled:opacity-50">
            {cancelling ? "Anulando..." : "Anular compra"}
          </button>
          <button
            type="button"
            disabled={cancelling}
            onClick={() => dialog.current?.close()}
            className="text-alt-dark cursor-pointer disabled:opacity-50">
            Volver
          </button>
        </div>
      </dialog>
    </main>
  );
}
