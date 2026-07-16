import { useEffect, useState } from "react"
import {PotusComun, PotusNjoy, PotusMarbleQueen, PotusLemon, PotusVariegado} from "../../assets/images"
import { SingonioComun, SingonioPuntaDeFlecha, SingonioVariegado, SingonioMaria, SingonioRosado } from "../../assets/images";
import { DiscountBadge, LabelBadge } from "../common"

export interface Plant {
    id: number;
    name: string;
    price: number;
    image: string;
    discount: number;
    label: string;
}


export default function ProductList({family}:{family:string}) {
    const potus: Plant[] = 
[
    {
        id: 0,
        name: "Comun",
        price: 7000,
        image: PotusComun,
        discount: 0,
        label: "oferta",
    },
    {
        id: 1,
        name: "N'Joy",
        price: 10000,
        image: PotusNjoy,
        discount: 0,
        label: "top",
    },
    {
        id: 2,
        name: "Marble Queen",
        price: 9000,
        image: PotusMarbleQueen,
        discount: 10,
        label: "",
    },
    {
        id: 3,
        name: "Lemon",
        price: 8000,
        image: PotusLemon,
        discount: 0,
        label: "ultimo",
    },
    {
        id: 4,
        name: "Variegado",
        price: 7000,
        image: PotusVariegado,
        discount: 0,
        label: "",
    }
]
const singonio: Plant[] = 
[
    {
        id: 0,
        name: "Comun",
        price: 7000,
        image: SingonioComun,
        discount: 0,
        label: "",
    },
    {
        id: 1,
        name: "Punta de flecha",
        price: 10000,
        image: SingonioPuntaDeFlecha,
        discount: 0,
        label: "top",
    },
    {
        id: 2,
        name: "Variegado",
        price: 9000,
        image: SingonioVariegado,
        discount: 0,
        label: "oferta",
    },
    {
        id: 3,
        name: "Maria",
        price: 8000,
        image: SingonioMaria,
        discount: 10,
        label: "",
    },
    {
        id: 4,
        name: "Rosado",
        price: 7000,
        image: SingonioRosado,
        discount: 0,
        label: "ultimo",
    }
]

    const [List, setList] = useState<Plant[]>([]);
    
    //function to get the family from bd, right now hard coded
    useEffect(()=>{
        family === 'Potus' ? setList(potus) : 
        family === 'Singonio' ? setList(singonio) : null
    },[])

  return (
    <main className="bg-bg-light flex flex-col items-center pt-4 overflow-scroll h-[calc(100vh+60px)]">
        <span className="font-Outfit text-4xl self-start text-black text-shadow-sm ml-4">{family}</span>
        
        
        <article className="grid grid-cols-2 w-11/12 justify-center items-center place-items-center mx-auto gap-2 bg-bg-light mt-4">
            { List.map((plant , index) => (
                <div key={index} className="w-full max-w-45 h-55 mb-3 relative bg-[linear-gradient(to_top,#F2EBE3_0%,#F2EBE3_25%,#D8CAB8_100%)] shadow-lg rounded-md">
                    <LabelBadge label={plant.label}/ >
                    <img src={plant.image} alt={plant.name} className="z-0" />
                    <div className="absolute bottom-0 flex flex-col px-2 pb-1 text-shadow-xs font-light">
                        <span className="text-black font-Outfit text-lg">{plant.name}</span>
                        <div className="flex gap-3 items-center">
                            <span className="text-black font-Manrope text-xl">$ {plant.price.toLocaleString('es-AR')}</span> 
                            <DiscountBadge discount={plant.discount}/>
                        </div>
                    </div>
                </div>
            ))
            }

        </article>
        
    </main>
  )
}
