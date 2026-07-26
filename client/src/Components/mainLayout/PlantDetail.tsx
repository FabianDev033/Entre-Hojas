import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"
import { useHeader } from "../../contexts/HeaderContext";
import * as Images from "../../assets/images"
import { Search, Share, Arrow, Arrow2, AddCart, Check } from "../../assets/icons";
import React from "react";
import { DiscountBadge } from "../common";
import { QuantityModal, ShippingModal } from "../plantDetail";
export interface PlantImage{
  id: number;
  url: string;
  tipo: string
}


interface Plant {
  id: number;
  nombre: string;
  familia: string;
  stock: number;
  precio: number;
  discount: number;
  etiqueta: string;
  origen: string;
  tipo: string;
  iluminacion: string;
  resistencia: string;
  tamano: string;
  cuidado: string;
  descripcion: string;
  imagenes: PlantImage[];
}



export default function PlantDetail({id}:{id?:number}) {
  const navigate = useNavigate();
  const {configureHeader} = useHeader()
  React.useEffect(() => {
      configureHeader({
        placeholder: "Buscar Entre Hojas",
        showBackButton: true,
        showShadow: false,
        showSearch: false,
        showShare: true,
        showHeader: false
      })
    }, [])

  const {id : idParam} = useParams();
  const selectedPlant = id ?? idParam;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plant, setPlant] = useState<Plant | null>(null)

  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
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
          setPlant([]);
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
  }, [selectedPlant]);

  const details = [
    {label: "Origen", value: plant?.origen},
    {label: "Tipo", value: plant?.tipo},
    {label: "Iluminacion", value: plant?.iluminacion},
    {label: "Resistencia", value: plant?.resistencia},
    {label: "Tamaño", value: plant?.tamano},
    {label: "Cuidados", value: plant?.cuidado},
  ]
  

  const [currentImage, setCurrentImage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const index = Math.round(
      scrollRef.current.scrollLeft / scrollRef.current.clientWidth
    );

    setCurrentImage(index);
  };

  const handleNavigate = (name: string) => {
    if (name) {
      navigate(`/categories/${name}`)
    }
  }
  const descripcion = plant?.descripcion === "Descripcion" ? 'El Potus Variegado es una de las plantas de interior más apreciadas por su elegante follaje verde con manchas y vetas en tonos crema o blanco. Su crecimiento vigoroso y su fácil mantenimiento la convierten en una excelente opción tanto para principiantes como para amantes de las plantas. Se adapta muy bien a espacios interiores con buena iluminación indirecta y requiere riegos moderados, permitiendo que el sustrato se seque ligeramente entre riegos. Puede cultivarse en macetas colgantes o guiarse como trepadora, aportando frescura y un toque natural a cualquier ambiente. Su combinación de colores y su resistencia hacen del Potus Variegado una de las plantas más versátiles y decorativas para el hogar u oficina' : plant?.descripcion;
  
  
  
  return (
    <main className="pb-30 bg-bg-light">
      {isLoading && <p className="mt-6 font-Manrope text-black">Cargando planta...</p>}
      {error && <p className="mt-6 font-Manrope text-black">{error}</p>}  

      <div className="w-screen h-12 fixed top-0 grid grid-cols-3 items-center bg-primary z-0 shadow-md"></div>
      <header className="w-screen h-12 fixed top-0 grid grid-cols-3 items-center z-10">        
        <div className="flex justify-center items-center w-10 h-10 cursor-pointer" onClick={() => navigate(-1)}>
          <div className="p-1.5 bg-primary/70 rounded-2xl cursor-pointer">
            <Arrow className="w-4 h-4 cursor-pointer z-20" />
          </div>
        </div>
        <div className="col-start-3 w-18 h-8 justify-self-center flex justify-between items-center">
          <div className="p-1.5 bg-primary/70 rounded-2xl cursor-pointer">
          <Search className="w-4 h-4 z-0" />
          </div>
          <div className="p-1.5 bg-primary/70 rounded-2xl cursor-pointer">
          <Share className="w-4 h-4 z-0"/>
          </div>
        </div>
      </header>

      {plant &&
      <div className="flex flex-col gap-2">
        <section className="relative">
          <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="w-full h-55 flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none z-0 relative shadow-[0_4px_4px_rgba(0,0,0,0.15)]">
            {plant.imagenes
            .filter((imagen)=> imagen.tipo === "detail")
            .map((imagen) => (
                <img
                key={imagen.id}
                src={Images[imagen.url as keyof typeof Images]}
                alt={plant.nombre}
                className="w-full shrink-0 snap-center object-cover -z-0"
                />
            ))}
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20 ">
            {plant.imagenes
            .filter((imagen)=> imagen.tipo === "detail")
            .map((_, index) => (
              <div
                key={index}
                className={`h-1 w-1 rounded-full transition-all duration-300 ease-in-out shadow-lg ${
                  currentImage === index
                    ? "bg-alt w-2"
                    : "bg-white"
                }`}
              />
            ))}
          </div>
        </section>
        <div className="flex flex-col gap-5">
          <section className="w-full flex flex-col gap-1 px-2">
            <span className="font-Outfit font-normal text-xs text-alt-dark cursor-pointer" onClick={()=>handleNavigate(plant.familia)}>Ver mas plantas {plant.familia}</span>
            <span className="font-Outfit font-normal text-xl text-black text-shadow-xs">{plant.familia} {plant.nombre}</span>
            <div className="flex gap-5 items-center pt-2">
              <span className="font-Manrope font-light text-4xl text-black text-shadow-xs">$ {plant.precio.toLocaleString("es-AR")} </span>
              <DiscountBadge discount={plant.discount} big={true}/>
            </div>
          </section>
          <section className="px-2 flex flex-col gap-2 ">
            <div className="flex gap-2 items-center text-center">
              <span className="font-Manrope font-light text-sm">Medios de pago</span>
              <img src={Images.BnaIcon} alt="Banco de la nacion argentina" className="h-3" />
              <img src={Images.MercadoPagoIcon} alt="Mercado Pago" className="h-5" />
              <img src={Images.CashIcon} alt="Efectivo" className="h-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-Manrope font-semibold text-sm text-secondary">Envio gratis</span>
              <span className="font-Manrope font-semibold text-xs text-secondary/70 cursor-pointer">Mas detalles y forma de entrega</span>
            </div>
          </section>
          <section className="px-2 flex flex-col gap-2">
            <span className="font-Manrope font-semibold  text-sm text-black text-shadow-xs">Stock Disponible</span>
            <div className="grid grid-cols-3 place-items-center font-Manrope font-light text-black text-sm bg-bg-darker/40 h-10 px-2 shadow-md rounded-sm cursor-pointer" onClick={()=>{setShowQuantityModal(true)}}>
              <span className="justify-self-start">Cantidad: {selectedQuantity}</span>
              <span className="text-black/50">(+{plant.stock} disponible)</span>
              <Arrow2 className="text-alt justify-self-end self-center h-5 w-5" />
            </div>
          </section>
          <section className="px-2 flex flex-col gap-2">
            <div className="h-10 flex justify-center items-center bg-primary-dark/80 text-bg-light font-Outfit text-xl rounded-sm shadow-md cursor-pointer">
              <span className="font-light">Pedir ahora</span>
            </div>
            <div className="h-10 flex justify-center items-center bg-primary-dark/35 text-primary-dark font-Outfit text-xl rounded-sm shadow-md cursor-pointer">
              <AddCart className="mr-2 -ml-4"/>
              <span className="font-normal">Agregar al carrito</span>
            </div>
          </section>
          <section className="px-2 flex flex-col gap-4">
            <hr className="border-t-2 border-black/50"></hr>
            <span className="font-Outfit font-medium text-black text-xl ">Detalles de producto</span>
            <div className="flex flex-col gap-3">
              {details.map((detail) => (
                <div key={detail.label} className="flex gap-1 items-center font-Manrope font-normal text-sm text-black">
                  <div className="bg-bg-darker/40 flex justify-center items-center w-7 h-7 rounded-2xl"><Check className=""/></div>
                  <span className="text-shadow-[0_4px_4px_rgba(0,0,0,0.10)] ml-2">{detail.label}:</span>
                  <span className="font-bold text-shadow-[0_4px_4px_rgba(0,0,0,0.10)]">{detail.value}</span>
                </div>
              ))}
            </div>
            <span className="font-Manrope font-light text-black text-xs mt-2">
              {

                descripcion?.split(". ").map((sentence, index) => (
                  <React.Fragment key={index}>
                    {sentence}.
                    <br />
                  </React.Fragment>
                ))
              }
            </span>
          </section>
        </div>
      </div>
      }
      {showQuantityModal && (
        <QuantityModal 
        onClose={()=>{setShowQuantityModal(false)}}
        setSelectedQuantity = {setSelectedQuantity}
        selectedQuantity={selectedQuantity}
        />
      )}

    </main>
  )
}
