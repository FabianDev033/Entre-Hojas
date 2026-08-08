import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Images from "../assets/images";
import { Arrow2, Checked, Trash } from "../assets/icons";
import { DiscountBadge } from "../Components/common";
import { useCart } from "../contexts/CartContext";
import type { CartStorageItem } from "../utils/cart";

interface PlantImage {
  id: number;
  url: string;
  tipo: string;
}

interface CartPlant {
  id: number;
  nombre: string;
  familia: string | null;
  precio: number;
  discount: number;
  stock: number;
  imagenes: PlantImage[];
}

interface CartProduct extends CartStorageItem {
  plant: CartPlant;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function formatMoney(value: number) {
  return `$ ${Math.round(value).toLocaleString("es-AR")}`;
}

function discountedPrice(price: number, discount: number) {
  return price * (1 - Math.max(0, discount) / 100);
}

function SelectionBox({ selected }: { selected: boolean }) {
  return selected ? (
    <Checked className="h-5 w-5 shrink-0" aria-hidden="true" />
  ) : (
    <span className="inline-flex h-5 w-5 shrink-0 rounded-xs border border-black/40" aria-hidden="true" />
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeItem, setQuantity } = useCart();
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedProductIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const controller = new AbortController();

    const loadCart = async () => {
      if (cart.length === 0) {
        setCartProducts([]);
        setSelectedProductIds(new Set());
        loadedProductIds.current = new Set();
        setError(null);
        setIsLoading(false);
        return;
      }

      const responses = await Promise.allSettled(
        cart.map(async (item) => {
          const response = await axios.get<CartPlant>(
            `${API_BASE_URL}/api/plantas/${encodeURIComponent(item.plantId)}`,
            { signal: controller.signal },
          );
          return { ...item, plant: response.data };
        }),
      );

      if (controller.signal.aborted) return;

      const products = responses
        .filter(
          (response): response is PromiseFulfilledResult<CartProduct> =>
            response.status === "fulfilled",
        )
        .map((response) => response.value);

      setCartProducts(products);
      setSelectedProductIds((current) => {
        const nextIds = new Set(products.map(({ plant }) => plant.id));
        const next = new Set([...current].filter((id) => nextIds.has(id)));

        products.forEach(({ plant }) => {
          if (!loadedProductIds.current.has(plant.id)) next.add(plant.id);
        });

        loadedProductIds.current = nextIds;
        return next;
      });
      setError(
        products.length === 0
          ? "No pudimos cargar los productos de tu carrito."
          : null,
      );
      setIsLoading(false);
    };

    void loadCart();

    return () => {
      controller.abort();
    };
  }, [cart]);

  const groupedProducts = useMemo(() => {
    const groups = new Map<string, CartProduct[]>();

    cartProducts.forEach((product) => {
      const family = product.plant.familia?.trim() || "Otros productos";
      groups.set(family, [...(groups.get(family) ?? []), product]);
    });

    return Array.from(groups, ([family, products]) => ({ family, products }));
  }, [cartProducts]);

  const selectedProducts = cartProducts.filter(({ plant }) => selectedProductIds.has(plant.id));
  const totalUnits = selectedProducts.reduce((total, product) => total + product.quantity, 0);
  const originalTotal = selectedProducts.reduce(
    (total, { plant, quantity }) => total + plant.precio * quantity,
    0,
  );
  const total = selectedProducts.reduce(
    (sum, { plant, quantity }) => sum + discountedPrice(plant.precio, plant.discount) * quantity,
    0,
  );
  const allSelected = cartProducts.length > 0 && selectedProductIds.size === cartProducts.length;

  const toggleProduct = (plantId: number) => {
    setSelectedProductIds((current) => {
      const next = new Set(current);
      if (next.has(plantId)) next.delete(plantId);
      else next.add(plantId);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedProductIds(
      allSelected ? new Set() : new Set(cartProducts.map(({ plant }) => plant.id)),
    );
  };

  const toggleFamily = (products: CartProduct[]) => {
    const familyIsSelected = products.every(({ plant }) => selectedProductIds.has(plant.id));

    setSelectedProductIds((current) => {
      const next = new Set(current);
      products.forEach(({ plant }) => {
        if (familyIsSelected) next.delete(plant.id);
        else next.add(plant.id);
      });
      return next;
    });
  };

  const updateQuantity = (plantId: number, quantity: number) => {
    setCartProducts((current) => current.map((product) =>
      product.plant.id === plantId ? { ...product, quantity } : product,
    ));
    setQuantity(plantId, quantity);
  };

  const removeProduct = (plantId: number) => {
    setCartProducts((current) => current.filter(({ plant }) => plant.id !== plantId));
    setSelectedProductIds((current) => {
      const next = new Set(current);
      next.delete(plantId);
      return next;
    });
    removeItem(plantId);
  };

  return (
    <main className="min-h-svh bg-bg-light pb-70 font-Outfit text-black">

      
      <section>
        {!isLoading && !error && cartProducts.length > 0 && (
          <button
          type="button"
          onClick={toggleAll}
          className="flex h-10 w-full items-center gap-2 border-b border-black/20 bg-bg px-2 text-left font-Outfit font-light text-sm text-black shadow-sm"
          aria-pressed={allSelected}
        >
          <SelectionBox selected={allSelected} />
          Todos los productos
        </button>
        )}
        

        {isLoading && <p className="px-2 py-8">Cargando carrito...</p>}
        {error && <p className="px-2 py-8 text-cancel">{error}</p>}

        {!isLoading && !error && cartProducts.length === 0 && (
          <div className="flex flex-col items-center gap-4 px-2 py-16 text-center">
            <p className="font-Outfit text-black text-2xl">Tu carrito esta vacio</p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-sm bg-primary-dark px-6 py-2 font-Manrope font-normal text-lg text-bg-light shadow-md cursor-pointer"
            >
              Ver plantas
            </button>
          </div>
        )}

        {groupedProducts.map(({ family, products }) => (
          <section key={family} className="border-y border-black/20 bg-bg shadow-sm mt-4">
            <button
              type="button"
              onClick={() => toggleFamily(products)}
              className="flex h-10 w-full items-center gap-2 px-2 text-left font-Outfit text-sm"
              aria-pressed={products.every(({ plant }) => selectedProductIds.has(plant.id))}
            >
              <SelectionBox selected={products.every(({ plant }) => selectedProductIds.has(plant.id))} />
              Productos de {family}
            </button>

            {products.map(({ plant, quantity }) => {
              const detailImage = plant.imagenes.find(({ tipo }) => tipo === "detail");
              const image = detailImage
                ? Images[detailImage.url as keyof typeof Images]
                : undefined;
              const discountedUnitPrice = discountedPrice(plant.precio, plant.discount);
              const quantityOptions = Array.from(
                { length: Math.max(quantity, 1, Math.min(plant.stock || 1, 20)) },
                (_, index) => index + 1,
              );

              return (
                <article key={plant.id} className="grid grid-cols-[24px_1fr] gap-2 border-t border-black/20 px-2 py-3">
                  <button
                    type="button"
                    className="h-5 w-5"
                    onClick={() => toggleProduct(plant.id)}
                    aria-label={`Seleccionar ${plant.nombre}`}
                    aria-pressed={selectedProductIds.has(plant.id)}
                  >
                    <SelectionBox selected={selectedProductIds.has(plant.id)} />
                  </button>

                  <div className="grid grid-cols-[minmax(112px,0.8fr)_minmax(0,1.35fr)] gap-2">
                    {image ? (
                      <img
                        src={image}
                        alt={plant.nombre}
                        className="h-full w-full rounded-sm bg-bg-darker/50 object-cover "
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-sm bg-bg-darker/50 px-3 text-center text-sm text-black/60">
                        Sin imagen
                      </div>
                    )}

                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-Outfit font-light text-sm  leading-tight">
                          {[plant.familia, plant.nombre].filter(Boolean).join(" ")}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeProduct(plant.id)}
                          className="p-1"
                          aria-label={`Quitar ${plant.nombre} del carrito`}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-end justify-between pt-5 ">
                        <label className="relative">
                          <span className="sr-only">Cantidad de {plant.nombre}</span>
                          <select
                            value={quantity}
                            onChange={(event) => updateQuantity(plant.id, Number(event.target.value))}
                            className="h-8 min-w-15 appearance-none rounded-md border border-black/20 bg-bg-light px-1 pr-5 text-xs outline-none cursor-pointer"
                          >
                            {quantityOptions.map((option) => (
                              <option key={option} value={option}>{option} u.</option>
                            ))}
                          </select>
                          <Arrow2 className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-secondary rotate-90" />
                        </label>

                        <div className="flex flex-col items-end gap-1 whitespace-nowrap">
                          {plant.discount > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-black/50 line-through">{formatMoney(plant.precio * quantity)}</span>
                              <DiscountBadge discount={plant.discount} size={'mini'} />
                            </div>
                          )}
                          <span className="font-Outfit font-light text-black text-xl">{formatMoney(discountedUnitPrice * quantity)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ))}
      </section>

      <aside className="font-Manrope fixed inset-x-0 bottom-0 z-20 border-t border-black/15 bg-bg-light px-2 py-4 shadow-[0_-8px_20px_rgba(0,0,0,0.13)]">
        <div className="mb-5 flex justify-between font-light text-sm">
          <span>Productos ({totalUnits})</span>
          <div className="flex gap-4">
            {originalTotal > total && <span className="text-black/45 line-through">{formatMoney(originalTotal)}</span>}
            <span>{formatMoney(total)}</span>
          </div>
        </div>
        <div className="mb-5 flex items-end justify-between font-medium text-xl">
          <span>TOTAL</span>
          <span>{formatMoney(total)}</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/checkout", {
            state: {
              items: selectedProducts.map(({ plant, quantity }) => ({
                plantId: plant.id,
                quantity,
              })),
            },
          })}
          disabled={selectedProducts.length === 0}
          className="h-10 w-full rounded-md bg-primary-dark/80 font-Outfit font-normal text-xl text-bg-light shadow-md disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer"
        >
          Continuar
        </button>
      </aside>
    </main>
  );
}
