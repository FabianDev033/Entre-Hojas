import axios from "axios";
import { useEffect, useState } from "react";
import * as Images from "../../assets/images"
import {PlantDetail} from "./"
import { DiscountBadge, LabelBadge } from "../common";
import { useParams } from "react-router-dom";

export interface Plant {
  id: number;
  name: string;
  price: number;
  image: string | null;
  discount: number;
  label: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function ProductList({family}:{family?:string}) {
  
  const {family : familyParam} = useParams();
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
        const requestedFamily = selectedFamily === "Ofertas" ? "AllPlants" : selectedFamily === "Todo" ? "AllPlants" : selectedFamily;
        const response = await axios.get<Plant[]>(
          `${API_BASE_URL}/api/plantas/familia/${encodeURIComponent(requestedFamily!)}`,
          { signal: controller.signal },
        );
        setList(selectedFamily === "Ofertas" ? response.data.filter((plant) => plant.label === "oferta") : response.data);
      } catch (requestError) {
        if (!axios.isCancel(requestError)) {
          setList([]);
          setError("No pudimos cargar las plantas. Intentá nuevamente más tarde.");
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

  const title = selectedFamily === "AllPlants" ? "" : selectedFamily === "Offers" ? "Ofertas" : selectedFamily;

  const handlePlant = (id:number) =>{
    <PlantDetail id={id} />
  }

  return (
    <main className="bg-bg-light flex flex-col items-center pt-4 min-h-[calc(100svh-60px)]">
      <span className="font-Outfit text-4xl self-start text-black text-shadow-sm ml-4">{title}</span>

      {isLoading && <p className="mt-6 font-Manrope text-black">Cargando plantas...</p>}
      {error && <p className="mt-6 font-Manrope text-black">{error}</p>}

      {!isLoading && !error && (
        <article className="grid grid-cols-2 w-11/12 justify-center items-center place-items-center mx-auto gap-2 bg-bg-light mt-4 pb-30">
          {list.map((plant) => (
            <div key={plant.id} onClick={()=>{handlePlant(plant.id)}}
            className="w-full max-w-45 h-55 mb-3 relative bg-[linear-gradient(to_top,#F2EBE3_0%,#F2EBE3_25%,#D8CAB8_100%)] flex flex-col shadow-lg rounded-md cursor-pointer hover:shadow-2xl transition duration-300 ease-in-out">
              <LabelBadge label={plant.label} />
              {plant.image && <img src={Images[plant.image as keyof typeof Images]} alt={plant.name} className="z-0 max-h-9/12 object-contain" />}
              <div className="absolute bottom-0 left-0 flex flex-col px-2 pb-1 text-shadow-xs font-light">
                <span className="text-black font-Outfit text-lg">{plant.name}</span>
                <div className="flex gap-1 items-center">
                  <span className="text-black font-Manrope text-xl">$ {plant.price.toLocaleString("es-AR")}</span>
                  <DiscountBadge discount={plant.discount} />
                </div>
              </div>
            </div>
          ))}
        </article>
      )}
    </main>
  );
}
