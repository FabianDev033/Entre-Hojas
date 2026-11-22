import axios from "axios";
import { useEffect, useState } from "react";
import { productImageUrl } from "../../utils/productImage";
import { DiscountBadge, LabelBadge } from "../common";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { filterPlants } from "../../utils/productSearch";
import { isProductAvailable } from "../../utils/productAvailability";
import { NoStock } from "../../assets/icons";
export interface Plant {
  id: number;
  stock: number;
  habilitado: boolean;
  name: string;
  family?: string | null;
  price: number;
  image: string | null;
  discount: number;
  label: string;
  labels?: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function ProductList({ family }: { family?: string }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  const { family: familyParam } = useParams();
  const [list, setList] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedFamily = family ?? familyParam;

  useEffect(() => {
    const controller = new AbortController();

    const getPlantsByFamily = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const requestedFamily =
          selectedFamily === "Ofertas"
            ? "AllPlants"
            : selectedFamily === "Todo"
              ? "AllPlants"
              : selectedFamily;
        const response = await axios.get<Plant[]>(
          `${API_BASE_URL}/api/plantas/familia/${encodeURIComponent(requestedFamily!)}`,
          { signal: controller.signal },
        );
        setList(
          selectedFamily === "Ofertas"
            ? response.data.filter((plant) =>
                (plant.labels ?? [plant.label]).includes("oferta"),
              )
            : response.data,
        );
      } catch (requestError) {
        if (!axios.isCancel(requestError)) {
          setList([]);
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
  }, [selectedFamily]);

  const filteredPlants = filterPlants(list, query);
  const title = query
    ? `Resultados para “${query}”`
    : selectedFamily === "AllPlants"
      ? ""
      : selectedFamily === "Offers"
        ? "Ofertas"
        : selectedFamily;

  const handleNavigate = (id: number) => {
    if (id) navigate(`/detalle/${id}`);
  };
  const calcPrice = (price: number, discount: number) => {
    return price - price * (discount / 100);
  };

  return (
    <main className="bg-bg-light flex w-full flex-col items-center pt-6 min-h-[calc(100svh-64px)]">
      <span className="font-Outfit text-4xl self-start w-full max-w-6xl px-4 text-black text-shadow-sm">
        {title}
      </span>

      {isLoading && (
        <p className="mt-6 px-4 font-Manrope text-black" role="status">
          Cargando plantas...
        </p>
      )}
      {error && (
        <p className="mt-6 px-4 font-Manrope text-black" role="alert">
          {error}
        </p>
      )}
      {!isLoading && !error && filteredPlants.length === 0 && (
        <p className="mt-6 px-4 font-Manrope text-black" role="status">
          {query
            ? "No encontramos plantas con esa búsqueda. Probá con otro nombre."
            : "No hay plantas disponibles."}
        </p>
      )}

      {!isLoading && !error && (
        <article className="grid w-full max-w-6xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 justify-center items-stretch place-items-center mx-auto gap-3 sm:gap-4 bg-bg-light mt-6 px-4 pb-24 sm:pb-16">
          {filteredPlants.map((plant) => (
            <button
              type="button"
              key={plant.id}
              disabled={!isProductAvailable(plant)}
              aria-label={`${plant.family ?? ""} ${plant.name}${isProductAvailable(plant) ? "" : ": sin stock"}`.trim()}
              onClick={() => {
                if (isProductAvailable(plant)) handleNavigate(plant.id);
              }}
              className="w-full min-w-0 sm:h-72 aspect-4/6 relative overflow-hidden text-left bg-[linear-gradient(to_top,#F2EBE3_0%,#F2EBE3_25%,#D8CAB8_100%)] flex flex-col shadow-md rounded-md cursor-pointer enabled:hover:shadow-lg disabled:cursor-default transition duration-300 ease-in-out">
              {!isProductAvailable(plant) && (
                <>
                  <NoStock
                    className="absolute top-0 right-0 z-10 h-20 w-20 drop-shadow-md"
                    aria-hidden="true"
                  />
                  <span className="absolute top-5.5 -right-2 z-10 w-20 flex items-center justify-center text-white font-outfit font-normal text-xs rotate-45 ">
                    SIN STOCK
                  </span>
                </>
              )}
              {plant.image && (
                <img
                  src={productImageUrl(plant.image)}
                  alt={plant.name}
                  className={`z-0 max-h-9/12 object-contain ${isProductAvailable(plant) ? "" : "opacity-60 grayscale-50"}`}
                />
              )}
              {/*{plant.family && (
                <span
                  className="absolute bottom-16 left-0 w-full truncate px-2 text-black font-Outfit text-lg font-light"
                  title={plant.family}>
                  {plant.family}
                </span>
              )}*/}
              <div className="absolute bottom-0 left-0 flex flex-col py-3 gap-2 font-light w-full">
                {isProductAvailable(plant) &&
                  plant.labels &&
                  plant.labels.length > 0 && <LabelBadge label={plant.label} />}
                <div className="text-black font-Outfit text-base sm:text-lg leading-tight flex wrap-break-word gap-.5 px-3">
                  <span className="">
                    {plant.family} {plant.name}
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center w-full gap-2 px-3">
                  <span className="text-black font-Manrope text-2xl justify-self-start">
                    $
                    {calcPrice(plant.price, plant.discount).toLocaleString(
                      "es-AR",
                    )}
                  </span>
                  <DiscountBadge discount={plant.discount} size={"mini"} />
                </div>
              </div>
            </button>
          ))}
        </article>
      )}
    </main>
  );
}
