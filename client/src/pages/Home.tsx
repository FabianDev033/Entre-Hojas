import {PromoPotus1, PromoIcon, SingonioIcon, PotusIcon, MonsteraIcon, CalatheaIcon, MarantaIcon, PhilodendroIcon, AnturioIcon} from "../assets/images";
import {Truck, Card, Plant} from "../assets/icons";
import {useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useHeader } from "../contexts/HeaderContext";
import { ProductList } from "../Components/categories";
const categories = [
  {name: "Ofertas", icon: PromoIcon, path: "./categories/Ofertas"},
  {name: "Singonio", icon: SingonioIcon, path: "/categories/Singonio"},
  {name: "Potus", icon: PotusIcon, path: "/categories/Potus"},
  {name: "Monstera", icon: MonsteraIcon, path: "/categories/Monstera"},
  {name: "Maranta", icon: MarantaIcon, path: "/categories/Maranta"},
  {name: "Calathea", icon: CalatheaIcon, path: "/categories/Calathea"},
  {name: "Philodendro", icon: PhilodendroIcon, path: "/categories/Philodendro"},
  {name: "Anturio", icon: AnturioIcon, path: "/categories/Anturio"},
]
const features = [
  {name: "Envios a San Luis y Villa Mercedes", icon: Truck},
  {name: "Diferentes medios de pago", icon: Card},
  {name: "Cultivadas Localmente", icon: Plant}
]

export default function Home() {
  const { configureHeader } = useHeader();
  const navigate = useNavigate();

  useEffect(() => {
    configureHeader({
      placeholder: "Buscar Entre Hojas",
      showBackButton: false,
      showShadow: false,
    });
  }, []);

  const handleCategories = (path?: string) => {
    if (path) {
      navigate(path)
    }
  }

  return (
    <main className="bg-bg-light min-w-screen flex flex-col items-center  text-white">
      <div className="bg-[linear-gradient(to_bottom,#A8C09A_0%,#A8C09A_40%,#F5F1E8_100%)] h-63 w-screen absolute z-0"></div>
      <section className="flex z-10 w-[95%] h-65 bg-bg mt-2 rounded-md shadow-md">
        <div className="flex flex-col items-center justify-between w-[45%]">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-4xl font-Outfit font-regular text-black text-shadow-sm">POTUS</h1>
            <span className="text-lg font-Manrope text-black">Llevate 3</span>
          </div>
          <div className="flex flex-col  h-7/12">
            <span className="text-lg font-Manrope text-black/50 line-through ">$ 20.000 </span>
            <span className="text-4xl font-Manrope text-black text-shadow-sm">$ 18.000</span>
            <span className="text-xl font-Outfit bg-primary-dark color-bg w-fit px-2 mt-4 shadow-md">10% OFF</span>
          </div>
        </div>
        <div className="flex flex-col  w-[55%]">
          <img src={PromoPotus1} alt="Promo Potus 1" className="h-full rounded-r-md object-cover object-[35%_center]"/>
        </div>
      </section>
      <section className="flex overflow-scroll scrollbar-none  gap-7 w-screen h-fit p-2">
        {categories.map((category, index) => (
          <div key={index} className="flex flex-col items-center gap-0 cursor-pointer" onClick={()=>{handleCategories(category.path)}}>
            <img src={category.icon} alt={category.name} className="w-20 h-20 object-contain"/>
            <span className="text-sm font-Outfit text-black">{category.name}</span>
          </div>
        ))}
      </section>
      <section className="flex justify-around items-center w-full h-40">
        {
          features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center text-center w-30 h-30 gap-3">
              <feature.icon className="w-12 h-12"/>
              <span className="text-xs font-Manrope text-black w-20">{feature.name}</span>
          </div>
        ))}
      </section>
      <section className=" w-full">
        <ProductList family="AllPlants" />
      </section>
    </main>
  );
}