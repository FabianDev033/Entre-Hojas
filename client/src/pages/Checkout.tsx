import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios';
import {User, Phone, Location, } from "../assets/icons"
import { BnaIcon, CashIcon, MercadoPagoIcon } from '../assets/images';
import LocationModal from "../Components/checkout/LocationModal"
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import {
    formatLocation,
    readSavedLocation,
    saveLocation,
    type SavedLocation,
} from "../utils/location";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function formatMoney(value: number) {
  return `$ ${Math.round(value).toLocaleString("es-AR")}`;
}

function discountedPrice(price: number, discount: number) {
  return price * (1 - Math.max(0, discount) / 100);
}

export default function Checkout() {

    const [showLocationModal, setShowLocationModal] = useState(false)
    const [savedLocation, setSavedLocation] = useState<SavedLocation | null>(
        () => readSavedLocation(),
    )
    const displayAddress = savedLocation ? `${savedLocation.address.split(",")[0]}, ${savedLocation.city}` : '';
    const handleLocationSave = (location: SavedLocation) => {
        saveLocation(location);
        setSavedLocation(location);
        setShowLocationModal(false);
    };

    interface CheckoutItem {
        plantId: number;
        quantity: number;
    }

    interface CheckoutPlant {
        id: number;
        nombre: string;
        familia: string;
        precio: number;
        discount: number;
    }

    const location = useLocation();
    const items = (location.state as { items?: CheckoutItem[] } | null)?.items;
    const [plants, setPlants] = useState<CheckoutPlant[]>([]);
    const [isLoadingPlants, setIsLoadingPlants] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { removeItem } = useCart();
    useEffect(() => {
        if (!items || items.length === 0) {
            navigate("/", { replace: true });
            return;
        }

        const controller = new AbortController();

        const fetchPlants = async () => {
            setIsLoadingPlants(true);
            setLoadError(null);
            try {
                const responses = await Promise.all(
                    items.map((item) =>
                        axios.get(`${API_BASE_URL}/api/plantas/${item.plantId}`, {
                            signal: controller.signal,
                        }),
                    ),
                );
                if (!controller.signal.aborted) setPlants(responses.map((response) => response.data));
            } catch (error) {
                if (!axios.isCancel(error) && !controller.signal.aborted) {
                    setLoadError("No pudimos cargar el resumen de tu compra.");
                }
            } finally {
                if (!controller.signal.aborted) setIsLoadingPlants(false);
            }
        };

        void fetchPlants();
        return () => controller.abort();
    }, [items, navigate]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!items || !savedLocation) {
            setSubmitError("Completá tus datos y agregá una dirección de entrega.");
            return;
        }

        const formData = new FormData(event.currentTarget);
        const nombre = String(formData.get("nombre") ?? "").trim();
        const telefono = String(formData.get("telefono") ?? "").trim();
        if (!nombre) {
            setSubmitError("Ingresá tu nombre completo.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const response = await axios.post<{ orderId: number }>(`${API_BASE_URL}/api/ordenes/checkout`, {
                items,
                customer: {
                    nombre,
                    telefono: telefono || undefined,
                    direccion: [savedLocation.address, savedLocation.city, savedLocation.details].filter(Boolean).join(", "),
                },
            });
            items.forEach(({ plantId }) => removeItem(plantId));
            navigate(`/order/${response.data.orderId}`, { replace: true });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setSubmitError(error.response?.data?.error ?? "No pudimos crear la orden. Intentá nuevamente.");
            } else {
                setSubmitError("No pudimos crear la orden. Intentá nuevamente.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <main className='min-h-svh bg-bg-light flex flex-col gap-5 items-center'>
        <section className='w-11/12 flex flex-col gap-3 font-Manrope text-black font-light text-sm mt-3'>
            <form id="checkout-form" onSubmit={handleSubmit} className='flex flex-col gap-3'>
                <span className='font-Outfit font-normal text-lg'>Datos de contacto</span>
                <label className='relative flex items-center'>
                    <User className='absolute left-3 h-5'/>
                    <input name='nombre' type="text" id='nombre' placeholder='Nombre completo' className='border border-alt-faded rounded-sm focus:outline-none h-10 px-10 w-full shadow-sm'/>
                </label>
                <label className='relative flex items-center'>
                    <Phone className='absolute left-3 h-5'/>
                    <input name='telefono' type="tel" id='telefono' placeholder='Numero de telefono' className='border border-alt-faded rounded-sm focus:outline-none h-10 px-10 w-full shadow-sm'/>
                </label>
                <button type="button" className='relative flex items-center border border-alt-faded rounded-sm focus:outline-none h-13 px-10 w-full shadow-sm cursor-pointer text-left' onClick={()=>{setShowLocationModal(true)}}>
                    <Location className='absolute left-3 h-5'/>
                    <div className='flex flex-col'>
                        <span className='font-normal text-black'>{displayAddress || 'Tu ubicación'}</span>
                        <span className='font-normal text-xs text-alt-faded'>{savedLocation ? formatLocation(savedLocation) : 'Agregar dirección'}</span>
                        {savedLocation?.details && <span className='font-normal text-xs text-alt-faded truncate'>Detalles: {savedLocation.details}</span>}
                    </div>
                </button>
            </form>
        </section>
        <section className='w-11/12 flex flex-col justify-start gap-3 font-Manrope text-black font-light text-sm'>
            <hr className='border border-black/30'/>
            <span className='font-Outfit font-normal text-lg'>Medios de pago</span>
            <form className='px-4 flex flex-col gap-4'>
                <label className='flex gap-3 items-center'>
                    <input name='pago' type="radio" className='appearance-none w-4 h-4 border border-black/30 bg-bg-light rounded-lg checked:bg-primary checked:border-primary'/>
                        <div className='flex items-center gap-2'>
                            <div className='border border-black/10 rounded-full p-1'>
                                <img src={BnaIcon} alt="" className='h-5' />
                            </div>
                            <span>Transferencia</span>
                        </div>
                </label>
                <label className='flex gap-3 items-center'>
                    <input name='pago' type="radio" className='appearance-none w-4 h-4 border border-black/30 bg-bg-light rounded-lg checked:bg-primary checked:border-primary'/>
                    <div className='flex items-center gap-2'>
                        <div className='border border-black/10 rounded-full p-1'>
                            <img src={MercadoPagoIcon} alt="" className='h-5' />
                        </div>
                        <span>Mercado Pago</span>
                    </div>
                </label>
                <label className='flex gap-3 items-center'>
                    <input name='pago' type="radio" className='appearance-none w-4 h-4 border border-black/30 bg-bg-light rounded-lg checked:bg-primary checked:border-primary'/>
                    <div className='flex items-center gap-2'>
                        <div className='border border-black/10 rounded-full p-1'>
                            <img src={CashIcon} alt="" className='h-5' />
                        </div>
                        <span>Efectivo</span>
                    </div>
                </label>
            </form>
        </section>
        <section className='w-11/12 font-Manrope font-light text-black text-sm flex flex-col gap-3'>
            <hr className='border border-black/30'/>
            <span className='font-Outfit font-normal text-lg'>Resumen de compra</span>
            {isLoadingPlants && <span>Cargando productos...</span>}
            {loadError && <span className="text-red-700">{loadError}</span>}
            {
                plants.map((plant, index) => {
                    const item = items?.find(i => i.plantId === plant.id);
                    if (!item) return null;
                    const quantity = item.quantity;
                    const price = discountedPrice(plant.precio, plant.discount);
                    return (
                            <div key={`${plant.id}-${index}`} className='flex justify-between items-center'>
                                <span>{quantity} x {plant.familia} {plant.nombre}</span>
                                <span>{formatMoney(price * quantity)}</span>
                            </div>
                    )
                })
            }
            {
                plants.map((plant, index) => {
                    const item = items?.find(i => i.plantId === plant.id);
                    if (!item) return null;
                    const discountedPriceValue = discountedPrice(plant.precio, plant.discount);
                    if (plant.discount > 0) {
                        return (
                            <div key={index} className='flex justify-between items-center text-black text-sm font-Manrope font-light'>
                                <span>Descuento total</span>
                                <span className="text-primary-dark">-{formatMoney((plant.precio - discountedPriceValue) * item.quantity)}</span>
                            </div>
                        )
                    }
            },     )}
            <div className="flex justify-between items-center">
                <span>Envio</span>
                <span className="text-primary-dark">Gratis</span>
            </div>
        </section>
        <section className='w-11/12 flex flex-col gap-3 justify-between text-black text-xl'>
            <hr className='border border-black/30'/>
            <div className='flex justify-between'>
                <span className='font-Outfit font-normal'>Total</span>
                <span className='font-Manrope font-normal'>{formatMoney(plants.reduce((acc, plant) => {
                    const item = items?.find(i => i.plantId === plant.id);
                    if (!item) return acc;
                    const quantity = item.quantity;
                    const price = discountedPrice(plant.precio, plant.discount);
                    return acc + (price * quantity);
                }, 0))}</span>
            </div>
        </section>
        <section className='w-full h-22 flex flex-col gap-3 justify-between items-center text-black text-xl font-Outfit font-light bg-bg-light fixed bottom-0 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.25)]'>
            {submitError && <span className="w-11/12 text-center font-Manrope text-sm text-red-700">{submitError}</span>}
            <button form="checkout-form" type="submit" disabled={isSubmitting || isLoadingPlants || !!loadError} className="w-11/12 py-2 mt-3 bg-primary-dark/80 text-bg-light rounded-md shadow-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">
                {isSubmitting ? "Creando orden..." : "Ordenar y finalizar"}
            </button>
        </section>
        {
            showLocationModal && (
                <LocationModal
                    initialLocation={savedLocation}
                    onClose={()=>setShowLocationModal(false)}
                    onSave={handleLocationSave}
                />
            )
        }
    </main>
  )
}
