import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PurchaseForm from "../../Components/admin/PurchaseForm";
import type { Product } from "../../contexts/ProductsContext";
import {
  purchaseError,
  purchasesApi,
  type Purchase,
} from "../../utils/purchases";

export default function PurchaseEditor() {
  const { id } = useParams();
  const [data, setData] = useState<{
    id?: string;
    products: Product[];
    purchase?: Purchase;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const [products, purchase] = await Promise.all([
          purchasesApi.get<Product[]>("/productos/inventario", {
            signal: controller.signal,
          }),
          id
            ? purchasesApi.get<Purchase>(`/compras/${id}`, {
                signal: controller.signal,
              })
            : Promise.resolve(null),
        ]);
        if (!controller.signal.aborted) {
          setError(null);
          setData({ id, products: products.data, purchase: purchase?.data });
        }
      } catch (loadError) {
        if (!controller.signal.aborted)
          setError(
            purchaseError(
              loadError,
              "No se pudieron cargar los datos de la compra.",
            ),
          );
      }
    }
    void load();
    return () => controller.abort();
  }, [id, attempt]);
  return (
    <main className="h-svh overflow-y-auto overscroll-y-contain bg-bg-dark px-6 py-5 font-Manrope text-black">
      <div className="w-full max-w-[86.4rem]">
        {error ? (
          <div role="alert">
            <p className="text-cancel">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setAttempt((value) => value + 1);
              }}
              className="mt-3 text-alt-dark underline cursor-pointer"
            >
              Reintentar
            </button>
            <Link to="/admin/Compras" className="ml-4 text-alt-dark underline">
              Volver a compras
            </Link>
          </div>
        ) : !data || data.id !== id ? (
          <p role="status">Cargando compra...</p>
        ) : data.purchase?.anulada ? (
          <div>
            <h1 className="font-Outfit text-3xl">Compra anulada</h1>
            <p className="mt-3">
              Las compras anuladas se conservan como historial y no se pueden
              editar.
            </p>
            <Link
              to="/admin/Compras"
              className="mt-4 inline-block text-alt-dark underline"
            >
              Volver a compras
            </Link>
          </div>
        ) : (
          <PurchaseForm
            key={id ?? "new"}
            initialPurchase={data.purchase}
            products={data.products}
          />
        )}
      </div>
    </main>
  );
}
