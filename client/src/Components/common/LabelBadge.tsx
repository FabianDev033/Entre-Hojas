import {Promo, Fuego} from "../../assets/icons"
export default function LabelBadge({label}:{label:string}) {


  const labelPromo = () =>{
    return(
      <div className='flex w-fit px-2 h-5 justify-center items-center gap-1 bg-alt-dark rounded-r-sm'>
        <Promo className="h-3 w-3"/>
        <span className="text-white text-[.7rem] font-Manrope font-light">OFERTA</span>
      </div>
    )
  }

  const labelLasts = () =>{
    return(
      <div className='flex w-fit px-2 h-5 justify-center items-center gap-1 bg-secondary rounded-r-sm'>
        <span className="text-white text-[.7rem] font-Manrope font-light">!ULTIMOS!</span>
      </div>
    )
  }

  const labelMostSold = () =>{
    return(
      <div className='flex w-fit px-2 h-5 justify-center items-center gap-1 bg-secondary rounded-r-sm'>
        <Fuego className="h-3 w-3"/>
        <span className="text-white text-[.7rem] font-Manrope font-light">MAS VENDIDO</span>
      </div>
    )
  }

  return (
    <div className='absolute w-full bottom-16'>{label === "oferta"? labelPromo() : label === "ultimo"? labelLasts() : label === "top" ? labelMostSold() : null}</div>
  )
}
