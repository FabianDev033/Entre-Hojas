import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as Images from "../../assets/images";
import {
  Search,
  Share,
  Arrow,
  Arrow2,
  AddCart,
  Check,
  Close,
} from "../../assets/icons";
import React from "react";
import { DiscountBadge } from "../common";
import { QuantityModal, ShippingModal } from "../plantDetail";
import { useCart } from "../../contexts/CartContext";
import ProductSearch from "../common/ProductSearch";
import { productImageUrl } from "../../utils/productImage";
import { isProductAvailable } from "../../utils/productAvailability";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
export interface PlantImage {
  id: number;
  url: string;
  tipo: string;
}

interface Plant {
  id: number;
  nombre: string;
  familia: string;
  stock: number;
  habilitado: boolean;
  precio: number;
  discount: number;
  etiqueta: string;
  origen: string;
  tipo: string;
  iluminacion: string;
  resistencia: string;
  tamano: string;
  cuidado: string;
  petFriendly: boolean | null;
  descripcion: string;
  imagenes: PlantImage[];
}

export default function PlantDetail({ id }: { id?: number }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { id: idParam } = useParams();
  const selectedPlant = id ?? idParam;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plant, setPlant] = useState<Plant | null>(null);

  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showShippingModal, setShowShippingModal] = useState(false);

  const [hasAddedToCart, setHasAddedToCart] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const wasSearchOpen = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    const getPlantsByFamily = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const requestedPlant = selectedPlant;
        const response = await axios.get<Plant>(
          `${API_BASE_URL}/api/plantas/${encodeURIComponent(requestedPlant!)}`,
          { signal: controller.signal },
        );
        setPlant(response.data);
      } catch (requestError) {
        if (!axios.isCancel(requestError)) {
          setPlant(null);
          setError(
            "No pudimos cargar las plantas. Intentá nuevamente más tarde.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void getPlantsByFamily();

    return () => controller.abort();
  }, [selectedPlant]);

  useEffect(() => {
    setHasAddedToCart(false);
    setShowSearch(false);
  }, [selectedPlant]);

  useEffect(() => {
    if (showSearch) {
      wasSearchOpen.current = true;
    } else if (wasSearchOpen.current) {
      searchButtonRef.current?.focus();
      wasSearchOpen.current = false;
    }
  }, [showSearch]);

  const details = [
    { label: "Origen", value: plant?.origen },
    { label: "Tipo", value: plant?.tipo },
    { label: "Iluminacion", value: plant?.iluminacion },
    { label: "Resistencia", value: plant?.resistencia },
    { label: "Tamaño", value: plant?.tamano },
    { label: "Cuidados", value: plant?.cuidado },
    {
      label: "Apta para mascotas",
      value:
        plant?.petFriendly == null
          ? "Sin especificar"
          : plant.petFriendly
            ? "Sí"
            : "No",
    },
  ];

  const [currentImage, setCurrentImage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const index = Math.round(
      scrollRef.current.scrollLeft / scrollRef.current.clientWidth,
    );

    setCurrentImage(index);
  };

  const handleNavigate = (name: string) => {
    if (name) {
      navigate(`/categories/${name}`);
    }
  };

  const handleAddToCart = () => {
    if (!plant || !isProductAvailable(plant)) return;

    addItem(plant.id, selectedQuantity);
    setHasAddedToCart(true);
  };

  const handleOrderNow = () => {
    if (!plant || !isProductAvailable(plant)) return;

    navigate("/checkout", {
      state: {
        items: [
          {
            plantId: plant.id,
            quantity: selectedQuantity,
          },
        ],
      },
    });
  };
  const descripcion =
    plant?.descripcion === "Descripcion"
      ? "El Potus Variegado es una de las plantas de interior más apreciadas por su elegante follaje verde con manchas y vetas en tonos crema o blanco. Su crecimiento vigoroso y su fácil mantenimiento la convierten en una excelente opción tanto para principiantes como para amantes de las plantas. Se adapta muy bien a espacios interiores con buena iluminación indirecta y requiere riegos moderados, permitiendo que el sustrato se seque ligeramente entre riegos. Puede cultivarse en macetas colgantes o guiarse como trepadora, aportando frescura y un toque natural a cualquier ambiente. Su combinación de colores y su resistencia hacen del Potus Variegado una de las plantas más versátiles y decorativas para el hogar u oficina"
      : plant?.descripcion;
  const detailImages = plant?.imagenes.filter(
    (imagen) => imagen.tipo === "detail",
  );
  const calcPrice = (price: number, discount: number) => {
    return price - price * (discount / 100);
  };

  return (
    <main className="pb-24 bg-bg-light">
      {isLoading && (
        <p className="mt-6 font-Manrope text-black">Cargando planta...</p>
      )}
      {error && <p className="mt-6 font-Manrope text-black">{error}</p>}

      <div className="fixed inset-x-0 top-0 z-0 h-12 bg-primary shadow-md" />
      <header
        className="fixed inset-x-0 top-0 z-20 flex h-12 items-center justify-between px-3 sm:px-6"
        onBlur={(event) => {
          const nextFocus = event.relatedTarget;
          if (
            showSearch &&
            (!(nextFocus instanceof Node) ||
              !event.currentTarget.contains(nextFocus))
          ) {
            setShowSearch(false);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setShowSearch(false);
        }}>
        <button
          type="button"
          aria-label="Volver"
          className="z-20 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-primary/70"
          onClick={() => navigate(-1)}>
          <Arrow className="h-4 w-4" />
        </button>

        <div
          className={`absolute inset-y-0 left-14 right-3 z-10 flex items-center gap-2 origin-right transition-[opacity,transform] duration-200 ease-out sm:left-16 sm:right-6 ${
            showSearch
              ? "scale-x-100 opacity-100 w-7/12 ml-auto"
              : "pointer-events-none scale-x-95 opacity-0 w-7/12 ml-auto"
          }`}
          inert={!showSearch}>
          <ProductSearch expanded focusOnOpen={showSearch} />
          <button
            type="button"
            aria-label="Cerrar buscador"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-primary/70"
            onClick={() => setShowSearch(false)}>
            <Close className="h-4 w-4" />
          </button>
        </div>

        <div
          className={`ml-auto flex items-center gap-3 transition-[opacity,transform] duration-200 ease-out ${
            showSearch
              ? "pointer-events-none scale-95 opacity-0"
              : "scale-100 opacity-100"
          }`}
          aria-hidden={showSearch}>
          <button
            type="button"
            ref={searchButtonRef}
            aria-label="Abrir buscador"
            aria-expanded={showSearch}
            tabIndex={showSearch ? -1 : 0}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-2xl bg-primary/70"
            onClick={() => setShowSearch(true)}>
            <Search className="h-4 w-4" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/70">
            <Share className="h-4 w-4" />
          </div>
        </div>
      </header>

      {!isLoading && plant && !isProductAvailable(plant) && (
        <section className="flex flex-col items-center gap-4 px-4 py-16 text-center text-black">
          <h1 className="font-Outfit text-2xl">Este producto está sin stock</h1>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-sm bg-primary-dark px-5 py-2 text-white cursor-pointer">
            Volver al catálogo
          </button>
        </section>
      )}
      {!isLoading && plant && isProductAvailable(plant) && (
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
          <section className="relative lg:sticky lg:top-16">
            {(detailImages?.length ?? 0) > 0 ? (
              <>
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="relative left-1/2 w-screen -translate-x-1/2 h-64 sm:h-80 flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none shadow-[0_4px_4px_rgba(0,0,0,0.15)] lg:left-auto lg:w-full lg:translate-x-0 lg:h-full lg:rounded-md">
                  {detailImages?.map((imagen) => (
                    <img
                      key={imagen.id}
                      src={productImageUrl(imagen.url)}
                      alt={plant.nombre}
                      className="w-full shrink-0 snap-center object-cover"
                    />
                  ))}
                </div>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                  {detailImages?.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 w-1 rounded-full transition-all duration-300 ease-in-out shadow-lg ${
                        currentImage === index ? "bg-alt w-2" : "bg-white"
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-64 sm:h-80 lg:h-[34rem] flex items-center justify-center bg-transparent text-black/70 z-40">
                No hay imagenes disponibles
              </div>
            )}
          </section>
          <div className="flex flex-col gap-5">
            <section className="w-full flex flex-col gap-2">
              <span
                className="font-Outfit font-normal text-xs text-alt-dark cursor-pointer"
                onClick={() => handleNavigate(plant.familia)}>
                Ver mas plantas {plant.familia}
              </span>
              <span className="font-Outfit font-normal text-xl text-black text-shadow-xs">
                {plant.familia} {plant.nombre}
              </span>
              <div className="flex flex-wrap gap-4 items-center pt-2">
                <span className="font-Manrope font-light text-4xl text-black text-shadow-xs">
                  ${" "}
                  {calcPrice(plant.precio, plant.discount).toLocaleString(
                    "es-AR",
                  )}{" "}
                </span>
                <DiscountBadge discount={plant.discount} size={"big"} />
              </div>
            </section>
            <section className="flex flex-col gap-3">
              <div className="flex gap-2 items-center text-center">
                <span className="font-Manrope font-light text-sm">
                  Medios de pago
                </span>
                <img
                  src={Images.BnaIcon}
                  alt="Banco de la nacion argentina"
                  className="h-3"
                />
                <img
                  src={Images.MercadoPagoIcon}
                  alt="Mercado Pago"
                  className="h-5"
                />
                <img src={Images.CashIcon} alt="Efectivo" className="h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-Manrope font-semibold text-sm text-secondary">
                  Envio gratis
                </span>
                <span
                  className="font-Manrope font-semibold text-xs text-secondary/70 cursor-pointer"
                  onClick={() => {
                    setShowShippingModal(true);
                  }}>
                  Mas detalles y forma de entrega
                </span>
              </div>
            </section>
            <section className="flex flex-col gap-3">
              <span className="font-Manrope font-semibold  text-sm text-black text-shadow-xs">
                Stock Disponible
              </span>
              <div
                className="grid grid-cols-3 place-items-center font-Manrope font-light text-black text-sm bg-bg-darker/40 h-10 px-2 shadow-md rounded-sm cursor-pointer"
                onClick={() => {
                  setShowQuantityModal(true);
                }}>
                <span className="justify-self-start">
                  Cantidad: {selectedQuantity}
                </span>
                <span className="text-black/50">
                  (+{plant.stock} disponible)
                </span>
                <Arrow2 className="text-alt justify-self-end self-center h-5 w-5" />
              </div>
            </section>
            <section className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleOrderNow}
                className="h-10 flex justify-center items-center bg-primary-dark/80 text-bg-light font-Outfit text-xl rounded-sm shadow-md cursor-pointer">
                <span className="font-light">Pedir ahora</span>
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className="h-10 flex justify-center items-center bg-primary-dark/35 text-primary-dark font-Outfit text-xl rounded-sm shadow-md cursor-pointer">
                <AddCart className="mr-2 -ml-4" />
                <span className="font-normal">
                  {hasAddedToCart
                    ? "Agregado al carrito"
                    : "Agregar al carrito"}
                </span>
              </button>
              {hasAddedToCart && (
                <span
                  className="font-Manrope text-xs text-primary-dark"
                  aria-live="polite">
                  Se guardó {selectedQuantity}{" "}
                  {selectedQuantity === 1 ? "unidad" : "unidades"} en tu
                  carrito.
                </span>
              )}
            </section>
            <section className="flex flex-col gap-4 pt-2">
              <hr className="border-t-2 border-black/50"></hr>
              <span className="font-Outfit font-medium text-black text-xl ">
                Detalles de producto
              </span>
              <div className="flex flex-col gap-3">
                {details.map((detail) => (
                  <div
                    key={detail.label}
                    className="flex gap-1 items-center font-Manrope font-normal text-sm text-black">
                    <div className="bg-bg-darker/40 flex justify-center items-center w-7 h-7 rounded-2xl">
                      <Check className="" />
                    </div>
                    <span className="text-shadow-[0_4px_4px_rgba(0,0,0,0.10)] ml-2">
                      {detail.label}:
                    </span>
                    <span className="font-bold text-shadow-[0_4px_4px_rgba(0,0,0,0.10)]">
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
              <span className="font-Manrope font-light text-black text-xs mt-2">
                {descripcion?.split(". ").map((sentence, index) => (
                  <React.Fragment key={index}>
                    {sentence}.
                    <br />
                  </React.Fragment>
                ))}
              </span>
            </section>
          </div>
        </div>
      )}
      {showQuantityModal && plant && isProductAvailable(plant) && (
        <QuantityModal
          onClose={() => {
            setShowQuantityModal(false);
          }}
          setSelectedQuantity={setSelectedQuantity}
          selectedQuantity={selectedQuantity}
        />
      )}
      {showShippingModal && (
        <ShippingModal
          onClose={() => {
            setShowShippingModal(false);
          }}
        />
      )}
    </main>
  );
}
