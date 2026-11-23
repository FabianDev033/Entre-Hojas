import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Add, Trash } from "../../assets/icons";
import type { Product } from "../../contexts/ProductsContext";
import { useDashboardStats } from "../../contexts/DashboardStatsContext";
import {
  itemSubtotal,
  purchaseError,
  purchaseMoney,
  purchasesApi,
  purchaseTypes,
  todayDate,
  type Purchase,
  type PurchaseItem,
} from "../../utils/purchases";

const inputClass =
  "w-full min-w-0 rounded-sm border border-alt-dark/40 bg-bg-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-alt/40";
type DraftItem = {
  key: string;
  descripcion: string;
  tipo: PurchaseItem["tipo"];
  plantaId: string;
  cantidad: string;
  precioUnitario: string;
};
let draftItemId = 0;
const itemKey = () => String(++draftItemId);
const emptyItem = (): DraftItem => ({
  key: itemKey(),
  descripcion: "",
  tipo: "planta",
  plantaId: "",
  cantidad: "1",
  precioUnitario: "",
});

export default function PurchaseForm({
  initialPurchase,
  products,
}: {
  initialPurchase?: Purchase;
  products: Product[];
}) {
  const navigate = useNavigate();
  const { refreshStats } = useDashboardStats();
  const [fecha, setFecha] = useState(initialPurchase?.fecha ?? todayDate());
  const [proveedor, setProveedor] = useState(initialPurchase?.proveedor ?? "");
  const [observaciones, setObservaciones] = useState(
    initialPurchase?.observaciones ?? "",
  );
  const [items, setItems] = useState<DraftItem[]>(() =>
    initialPurchase?.items.length
      ? initialPurchase.items.map((item) => ({
          key: itemKey(),
          descripcion: item.descripcion,
          tipo: item.tipo,
          plantaId: item.plantaId === null ? "" : String(item.plantaId),
          cantidad: String(item.cantidad),
          precioUnitario: String(item.precioUnitario),
        }))
      : [emptyItem()],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total =
    items.reduce(
      (sum, item) =>
        sum +
        Math.round(Number(item.precioUnitario) * 100) * Number(item.cantidad),
      0,
    ) / 100;
  const stockUnits = items
    .filter((item) => item.tipo === "planta" && item.plantaId)
    .reduce((sum, item) => sum + Number(item.cantidad), 0);
  const updateItem = (key: string, patch: Partial<DraftItem>) =>
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  const legacy = initialPurchase && !initialPurchase.stockAplicado;

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    setError(null);
    if (!Number.isFinite(total) || total > 99_999_999.99) {
      setError("El total no puede superar $ 99.999.999,99.");
      return;
    }
    const body = {
      fecha,
      proveedor: proveedor.trim(),
      observaciones: observaciones.trim(),
      version: initialPurchase?.version,
      items: items.map((item) => ({
        descripcion: item.descripcion.trim(),
        tipo: item.tipo,
        plantaId: item.tipo === "planta" ? Number(item.plantaId) : null,
        cantidad: Number(item.cantidad),
        precioUnitario: Number(item.precioUnitario),
      })),
    };
    setSaving(true);
    try {
      if (initialPurchase)
        await purchasesApi.patch(`/compras/${initialPurchase.id}`, body);
      else await purchasesApi.post("/compras", body);
      void refreshStats();
      navigate("/admin/Compras", {
        state: {
          message: initialPurchase
            ? "Compra actualizada."
            : "Compra registrada.",
          fecha,
        },
      });
    } catch (saveError) {
      setError(
        purchaseError(
          saveError,
          "No se pudo guardar la compra. Intentá nuevamente.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="product-form @container"
      onSubmit={(event) => void save(event)}
    >
      <header className="mb-6">
        <h1 className="font-Outfit text-3xl font-medium">
          {initialPurchase ? "Editar compra" : "Nueva compra"}
        </h1>
        <p className="mt-1 text-sm text-black/60">
          {initialPurchase
            ? `Compra #${initialPurchase.id}`
            : "Registrá la compra de plantas, macetas e insumos."}
        </p>
      </header>
      <fieldset
        disabled={saving || initialPurchase?.anulada}
        className="grid min-w-0 gap-8 @3xl:grid-cols-[2fr_1fr] disabled:opacity-70"
      >
        <section className="flex min-w-0 flex-col gap-4">
          <h2 className="font-Outfit text-xl font-medium">
            Datos de la compra
          </h2>
          <div className="grid gap-4 @md:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-1 text-sm">
              Fecha
              <input
                type="date"
                required
                min="1000-01-01"
                max="9999-12-31"
                value={fecha}
                onChange={(event) => setFecha(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1 text-sm">
              Proveedor
              <input
                required
                maxLength={100}
                value={proveedor}
                onChange={(event) => setProveedor(event.target.value)}
                placeholder="Nombre del proveedor"
                className={inputClass}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            Resumen{" "}
            <span className="text-xs text-black/60">
              Opcional. Te ayuda a identificar la compra.
            </span>
            <textarea
              rows={3}
              maxLength={2000}
              value={observaciones}
              onChange={(event) => setObservaciones(event.target.value)}
              placeholder="Ej.: Reposición de plantas y macetas"
              className={`${inputClass} resize-y`}
            />
          </label>
        </section>
        <aside className="flex min-w-0 flex-col gap-3 self-start rounded-sm bg-bg-light p-4 shadow-sm">
          <h2 className="font-Outfit text-xl font-medium">Resumen</h2>
          <p className="text-sm text-black/60">
            {items.length} {items.length === 1 ? "ítem" : "ítems"}
          </p>
          <p className="text-sm">Total de la compra</p>
          <p
            className="break-words text-3xl font-medium tabular-nums"
            aria-live="polite"
          >
            {purchaseMoney(Number.isFinite(total) ? total : 0)}
          </p>
          <p className="border-t border-black/10 pt-3 text-xs text-black/70">
            {legacy
              ? "Compra anterior al stock automático. Guardar o anular esta compra no modifica el inventario."
              : initialPurchase
                ? "Al guardar se aplicará al stock la diferencia entre los ítems anteriores y los nuevos."
                : `${stockUnits || 0} unidades de plantas se sumarán al stock al guardar. Macetas y otros insumos se registran como gasto.`}
          </p>
        </aside>
        <section className="min-w-0 @3xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-Outfit text-xl font-medium">
              Ítems de la compra
            </h2>
            <button
              type="button"
              disabled={items.length >= 100}
              onClick={() => setItems((current) => [...current, emptyItem()])}
              className="flex items-center gap-2 rounded-sm border border-alt-dark/50 bg-bg-light px-3 py-2 text-sm text-alt-dark shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Add className="h-4 w-4" />
              Agregar ítem
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {items.map((item, index) => (
              <section
                key={item.key}
                aria-label={`Ítem ${index + 1}`}
                className="min-w-0 rounded-sm border border-black/15 bg-bg-light/40 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-Outfit text-lg">Ítem {index + 1}</h3>
                  <button
                    type="button"
                    disabled={items.length === 1}
                    onClick={() =>
                      setItems((current) =>
                        current.filter((row) => row.key !== item.key),
                      )
                    }
                    aria-label={`Quitar ítem ${index + 1}`}
                    className="rounded-sm p-2 text-cancel cursor-pointer disabled:opacity-30"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid min-w-0 gap-4 @md:grid-cols-2 @5xl:grid-cols-6">
                  <label className="flex min-w-0 flex-col gap-1 text-sm">
                    Tipo
                    <select
                      value={item.tipo}
                      onChange={(event) =>
                        updateItem(item.key, {
                          tipo: event.target.value as DraftItem["tipo"],
                          plantaId: "",
                          descripcion: "",
                        })
                      }
                      className={inputClass}
                    >
                      {purchaseTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {item.tipo === "planta" && (
                    <label className="flex min-w-0 flex-col gap-1 text-sm @5xl:col-span-2">
                      Planta
                      <select
                        required
                        value={item.plantaId}
                        onChange={(event) => {
                          const plant = products.find(
                            (product) =>
                              product.id === Number(event.target.value),
                          );
                          updateItem(item.key, {
                            plantaId: event.target.value,
                            descripcion: plant?.nombre ?? "",
                          });
                        }}
                        className={inputClass}
                      >
                        <option value="">Seleccioná una planta</option>
                        {products.map((plant) => (
                          <option key={plant.id} value={plant.id}>
                            {plant.nombre} · stock {plant.stock}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {item.tipo !== "planta" && (
                    <label className="flex min-w-0 flex-col gap-1 text-sm @5xl:col-span-5">
                      Descripción
                      <input
                        required
                        maxLength={150}
                        value={item.descripcion}
                        onChange={(event) =>
                          updateItem(item.key, {
                            descripcion: event.target.value,
                          })
                        }
                        placeholder="Ej.: Maceta plástica de 15 cm"
                        className={inputClass}
                      />
                    </label>
                  )}
                  <label className="flex min-w-0 flex-col gap-1 text-sm @5xl:col-span-2">
                    Cantidad
                    <input
                      type="number"
                      min="1"
                      max="2147483647"
                      step="1"
                      required
                      value={item.cantidad}
                      onChange={(event) =>
                        updateItem(item.key, { cantidad: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="flex min-w-0 flex-col gap-1 text-sm @5xl:col-span-2">
                    Precio unitario ($)
                    <input
                      type="number"
                      min="0"
                      max="99999999.99"
                      step="0.01"
                      required
                      value={item.precioUnitario}
                      onChange={(event) =>
                        updateItem(item.key, {
                          precioUnitario: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </label>
                  <div className="flex min-w-0 flex-col gap-1 text-sm @5xl:col-span-2">
                    <span>Subtotal</span>
                    <output className="py-2 font-medium tabular-nums">
                      {purchaseMoney(
                        itemSubtotal({
                          cantidad: Number(item.cantidad),
                          precioUnitario: Number(item.precioUnitario),
                        }),
                      )}
                    </output>
                  </div>
                </div>
              </section>
            ))}
          </div>
          {products.length === 0 && (
            <p className="mt-3 text-sm text-cancel">
              No hay plantas registradas. Podés cargar insumos o crear una
              planta desde Agregar producto.
            </p>
          )}
        </section>
      </fieldset>
      <div className="mt-5 min-h-5 text-sm" aria-live="polite">
        {error && (
          <p role="alert" className="text-cancel">
            {error}
          </p>
        )}
      </div>
      <div className="mt-3 mb-5 flex items-center gap-4 font-Outfit">
        <button
          type="submit"
          disabled={saving || initialPurchase?.anulada}
          className="rounded-sm bg-alt-dark px-5 py-2 text-lg font-light text-white shadow-sm cursor-pointer disabled:opacity-50"
        >
          {saving
            ? "Guardando..."
            : initialPurchase
              ? "Guardar cambios"
              : "Registrar compra"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => navigate("/admin/Compras")}
          className="text-sm text-alt-dark cursor-pointer disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
