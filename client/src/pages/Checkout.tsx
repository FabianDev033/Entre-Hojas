import { useEffect, useState } from 'react'
import { useHeader } from '../contexts/HeaderContext';
import {User, Phone, Location, } from "../assets/icons"
import { BnaIcon, CashIcon, MercadoPagoIcon } from '../assets/images';
import LocationModal from "../Components/checkout/LocationModal"
import {
    formatLocation,
    readSavedLocation,
    saveLocation,
    type SavedLocation,
} from "../utils/location";
export default function Checkout() {

    const { configureHeader } = useHeader();
    useEffect(() => {
        configureHeader({ 
            showHeader: true,
            showShadow: true,
            showBackButton: true,
            showShare: false,
            showSearch: false,
            showCheckoutTitle:true,
        });
    }, [configureHeader]);

    const [showLocationModal, setShowLocationModal] = useState(false)
    const [savedLocation, setSavedLocation] = useState<SavedLocation | null>(
        () => readSavedLocation(),
    )

    const handleLocationSave = (location: SavedLocation) => {
        saveLocation(location);
        setSavedLocation(location);
        setShowLocationModal(false);
    };
  return (
    <main className='min-h-[90svh] bg-bg-light flex flex-col gap-5 items-center'>
        <section className='w-11/12 flex flex-col gap-3 font-Manrope text-black font-light text-sm mt-3'>
            <form className='flex flex-col gap-3'>
                <span className='font-Outfit font-normal text-lg'>Datos de contacto</span>
                <label className='relative flex items-center'>
                    <User className='absolute left-3 h-5'/>
                    <input type="text" id='nombre' placeholder='Nombre completo' className='border border-alt-faded rounded-sm focus:outline-none h-10 px-10 w-full shadow-sm'/>
                </label>
                <label className='relative flex items-center'>
                    <Phone className='absolute left-3 h-5'/>
                    <input type="number" id='telefono' placeholder='Numero de telefono' className='border border-alt-faded rounded-sm focus:outline-none h-10 px-10 w-full shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'/>
                </label>
                <button type="button" className='relative flex items-center border border-alt-faded rounded-sm focus:outline-none h-13 px-10 w-full shadow-sm cursor-pointer text-left' onClick={()=>{setShowLocationModal(true)}}>
                    <Location className='absolute left-3 h-5'/>
                    <div className='flex flex-col'>
                        <span className='font-normal text-black'>{savedLocation?.address ?? 'Tu ubicación'}</span>
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
            <div className='flex justify-between'>
                <span>Potus Marble Queen</span>
                <span>$ 10.000</span>
            </div>
            <div className='flex justify-between'>
                <span>Descuento de productos</span>
                <span className='text-primary-dark font-medium'>-$ 1.000</span>
            </div>
            <div className='flex justify-between'>
                <span>Envio</span>
                <span className='text-primary-dark font-medium'>Gratis</span>
            </div>
        </section>
        <section className='w-11/12 flex flex-col gap-3 justify-between text-black text-xl'>
            <hr className='border border-black/30'/>
            <div className='flex justify-between'>
                <span className='font-Outfit font-normal'>Total</span>
                <span className='font-Manrope font-normal'>$ 9.000</span>
            </div>
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
