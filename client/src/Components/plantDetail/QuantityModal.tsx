import React, { useState } from 'react'
import { Close } from '../../assets/icons'
export default function QuantityModal(
  {
    onClose,
    setSelectedQuantity,
    selectedQuantity
  }:
  {
    onClose: ()=>void,
    setSelectedQuantity: React.Dispatch<React.SetStateAction<number>>,
    selectedQuantity: number
  }) 
{
  const [customQuantity, setCustomQuantity] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const options = [
    { label: "1 unidad", value: 1 },
    { label: "2 unidades", value: 2 },
    { label: "3 unidades", value: 3 },
    { label: "4 unidades", value: 4 },
    { label: "5 unidades", value: 5 },
    { label: "6 unidades", value: 6 },
    { label: "Más de 6 unidades", value: 0},
  ];
  console.log(options)

  const handleSelectQuantity = (value: number) => {
    if (value === 0) {
      setIsCustom(true);
      return;
    }

    setSelectedQuantity(value);
    onClose();
  };

  const handleCustomConfirm = () => {
    const quantity = Number(customQuantity);

    if (quantity > 6) {
      setSelectedQuantity(quantity);
      onClose();
    }
  };
  return (
    <article className='fixed top-0 h-screen w-screen z-30 backdrop-blur-[1px] bg-black/75 flex flex-col justify-end'>
      <div className='relative h-8/12 w-screen bg-bg-dark rounded-t-md' onClick={(e)=> e.stopPropagation()}>
        <button className='absolute -top-8 right-2' onClick={onClose}>
          <Close className='text-bg'/>
        </button>
        <div className='pt-5 flex flex-col gap-6 h-full'>
          <span className='font-Outfit font-normal text-black text-xl px-2 '>Elegi Cantidad</span>
          {!isCustom ? (
            <div className='flex flex-col justify-center items-center border-b border-black/30 rounded-lg font-Manrope font-normal text-black'>
              {options.map((option, value)=>(
                <div 
                key={value}
                onClick={()=>handleSelectQuantity(option.value)}
                className={`${selectedQuantity-1 === value  ? "bg-bg-darker/80" : ""} py-2.5 w-full border-t border-black/30 flex justify-center items-center text-lg cursor-pointer`}
                >{option.label}</div>
              ))}
            </div>
          ):(
            <div className="flex flex-col gap-4  items-center w-11/12">
              <span className="font-Manrope font-light text-lg self-start px-2">
                Escribi la cantidad deseada
              </span>

              <input
                type="number"
                min={7}
                value={customQuantity}
                onChange={(e) => setCustomQuantity(e.target.value)}
                placeholder="Ej: 12"
                className="border border-black/70 bg-bg-light shadow-md rounded-md px-3 py-2 text-lg outline-none"
              />

              <div className="flex gap-5">
                <button
                  onClick={() => setIsCustom(false)}
                  className="flex-1 py-2 rounded-sm bg-primary-dark/35 text-primary-dark font-Manrope font-medium text-lg cursor-pointer"
                >
                  Volver
                </button>

                <button
                  onClick={handleCustomConfirm}
                  className="flex-1 py-2 rounded-sm w-35 bg-primary-dark text-bg-light font-Manrope font-normal text-lg cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </article>
  )
}
