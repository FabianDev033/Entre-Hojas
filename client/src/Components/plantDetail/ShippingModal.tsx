import { Close } from "../../assets/icons"

export default function ShippingModal({onClose}:{onClose:()=>void}) {
  return (
    <article className='fixed top-0 h-screen w-screen z-30 backdrop-blur-[1px] bg-black/75 flex flex-col justify-end'>
          <div className='relative h-8/12 w-screen bg-bg-dark rounded-t-md' onClick={(e)=> e.stopPropagation()}>
            <button className='absolute -top-8 right-2 cursor-pointer' onClick={onClose}>
              <Close className='text-bg'/>
            </button>
            <div className="mt-4 flex flex-col gap-3 px-2 text-black font-normal">
              <span className="font-Outfit text-lg ">Envio y forma de pago</span>
              <span className="font-Manrope font-light text-sm ">Una vez que realice su pedido, nos pondremos en contacto con usted a través de WhatsApp para confirmar la compra y coordinar el día y horario de entrega.</span>
              <span className="font-Outfit text-lg ">El envío es totalmente gratuito</span>
              <ul className="font-Manrope font-light text-sm px-4 list-disc flex flex-col gap-3">
                <li><span className="font-medium">Villa Mercedes</span>: realizamos entregas a la mayor brevedad posible, según disponibilidad.</li>
                <li><span className="font-medium">San Luis capital</span>: las entregas se realizan durante el fin de semana y le informaremos con anticipación el horario previsto.</li>
              </ul>
              <div className="font-Manrope font-light text-sm flex flex-col">
                <span>El pago se efectúa al momento de la entrega del pedido.</span>
                <span>Puede abonarlo en efectivo o mediante transferencia bancaria.</span>
              </div>
            </div>
          </div>
        </article>
  )
}
