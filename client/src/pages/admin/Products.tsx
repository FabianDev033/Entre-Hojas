import { useMemo, useState } from "react";
import {
  Accept,
  Add,
  AddStock,
  Cancel,
  List,
  Search,
  Subtract,
} from "../../assets/icons";
import { useProducts } from "../../contexts/ProductsContext";
import { DiscountBadge } from "../../Components/common";

type ProductView = "list" | "stock";

export default function Products() {
  const [view, setView] = useState<ProductView>("list");
  const [search, setSearch] = useState("");
  const [stockAdditions, setStockAdditions] = useState<Record<number, number>>(
    {},
  );
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { products, isLoading, error, addStock } = useProducts();

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es");
    if (!normalizedSearch) return products;
    return products.filter((product) =>
      `${product.id} ${product.nombre} ${product.categoria ?? ""}`
        .toLocaleLowerCase("es")
        .includes(normalizedSearch),
    );
  }, [products, search]);

  const adjustAddition = (id: number, amount: number) => {
    setStockAdditions((current) => ({
      ...current,
      [id]: Math.max(0, (current[id] ?? 0) + amount),
    }));
  };

  const cancelAddition = (id: number) => {
    setStockAdditions((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setActionError(null);
  };

  const confirmAddition = async (id: number) => {
    const addition = stockAdditions[id] ?? 0;
    if (addition < 1) return;

    setActionError(null);
    setUpdatingId(id);
    try {
      await addStock(id, addition);
      cancelAddition(id);
    } catch (saveError) {
      setActionError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar el stock.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const gridColumns =
    view === "list"
      ? "grid-cols-[0.5fr_1fr_1fr_0.8fr_1.5fr_0.8fr]"
      : "grid-cols-[0.4fr_1fr_0.9fr_0.6fr_1fr_0.8fr_1fr]";

  return (
    <main className="h-svh w-full bg-bg-dark flex flex-col gap-10 items-center overflow-hidden">
      <div className="mt-3 mr-60 gap-8 flex items-center justify-center">
        {view === "list" ? (
          <button
            aria-label="Abrir actualización de stock"
            title="Actualizar stock"
            type="button"
            onClick={() => setView("stock")}>
            <AddStock className="w-8 aspect-square text-black cursor-pointer" />
          </button>
        ) : (
          <button
            aria-label="Volver a productos"
            title="Productos"
            type="button"
            onClick={() => setView("list")}>
            <List className="w-8 aspect-square text-black cursor-pointer" />
          </button>
        )}

        <div className="relative z-10 justify-self-center flex items-center py-2 px-4 bg-bg-light rounded-sm shadow-md border border-alt-dark">
          <input
            className="text-sm font-Manrope focus:outline-none"
            placeholder="Buscar productos"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="w-full h-full bg-transparent flex justify-center items-center rounded-r-md">
            <Search className="w-6 h-6 text-black" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center w-full h-full px-4 min-h-0">
        <div
          className={`w-full min-h-10 rounded-md bg-bg-light shadow-md grid ${gridColumns} place-items-center font-Outfit font-normal text-md text-black`}>
          <span className="w-full text-center">ID</span>
          <span className="w-full text-center">Nombre</span>
          <span className="w-full text-center">Categoria</span>
          <span className="w-full text-center">Stock</span>
          {view === "list" ? (
            <>
              <span className="w-full text-center">Precio</span>
              <span className="w-full text-center">Ventas</span>
            </>
          ) : (
            <>
              <span className="w-full text-center">Agregar</span>
              <span className="w-full text-center">Opciones</span>
              <span className="w-full text-center">Stock actualizado</span>
            </>
          )}
        </div>

        {isLoading && (
          <p className="py-6 font-Manrope">Cargando productos...</p>
        )}
        {error && (
          <p role="alert" className="py-6 font-Manrope text-red-800">
            {error}
          </p>
        )}
        {actionError && (
          <p role="alert" className="py-2 font-Manrope text-red-800">
            {actionError}
          </p>
        )}

        <div className="w-full h-full min-h-0 overflow-y-auto flex flex-col pt-4 gap-4 items-center justify-start pb-10">
          {!isLoading &&
            !error &&
            filteredProducts.map((product) => {
              const addition = stockAdditions[product.id] ?? 0;
              return (
                <div
                  key={product.id}
                  className={`w-full min-h-14 grid ${gridColumns} place-items-center border-b border-black/15 font-Manrope text-md text-black`}>
                  <span>{product.id}</span>
                  <span className="text-center">{product.nombre}</span>
                  <span className="text-center">
                    {product.categoria ?? "—"}
                  </span>
                  <span>{product.stock}</span>
                  {view === "list" ? (
                    <>
                      <span className="flex gap-4 items-center leading-tight text-md">
                        <span>
                          $
                          {(
                            product.precio *
                            (1 - Math.max(0, product.discount) / 100)
                          ).toLocaleString("es-AR")}
                        </span>
                        {product.discount > 0 && (
                          <>
                            <span className="text-black/45 line-through">
                              ${product.precio.toLocaleString("es-AR")}
                            </span>
                            <DiscountBadge
                              discount={product.discount}
                              size="mini"
                            />
                          </>
                        )}
                      </span>
                      <span>{product.ventas}</span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-5">
                        <button
                          aria-label={`Restar una unidad a agregar para ${product.nombre}`}
                          className="flex items-center justify-center text-alt-dark disabled:opacity-40 cursor-pointer transition-all duration-200 ease-in-out"
                          type="button"
                          disabled={addition === 0 || updatingId === product.id}
                          onClick={() => adjustAddition(product.id, -1)}>
                          <Subtract className="w-5 h-2.5" />
                        </button>
                        <span className="min-w-6 text-center font-Outfit">
                          {addition}
                        </span>
                        <button
                          aria-label={`Agregar una unidad al ajuste de ${product.nombre}`}
                          className="flex items-center justify-center text-alt-dark cursor-pointer"
                          type="button"
                          disabled={updatingId === product.id}
                          onClick={() => adjustAddition(product.id, 1)}>
                          <Add className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-center gap-5">
                        <button
                          aria-label={`Confirmar stock de ${product.nombre}`}
                          title="Confirmar"
                          type="button"
                          disabled={addition === 0 || updatingId === product.id}
                          onClick={() => void confirmAddition(product.id)}
                          className="text-alt-dark disabled:opacity-40 transition-all duration-200 ease-in-out cursor-pointer">
                          <Accept className="w-8 h-8" />
                        </button>
                        <button
                          aria-label={`Cancelar actualización de ${product.nombre}`}
                          title="Cancelar"
                          type="button"
                          disabled={updatingId === product.id}
                          onClick={() => cancelAddition(product.id)}
                          className="text-secondary disabled:opacity-40 transition-all duration-200 ease-in-out cursor-pointer">
                          <Cancel className="w-8 h-8" />
                        </button>
                      </div>
                      <span
                        className={` transition-all duration-200 ease-in-out
                          ${addition > 0 ? "font-medium" : "text-black/50"}
                        `}>
                        {product.stock + addition}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
        </div>

        {!isLoading && !error && filteredProducts.length === 0 && (
          <p className="py-6 font-Manrope">No hay productos para mostrar.</p>
        )}
      </div>
    </main>
  );
}
