import {
  PotusPromo10Off,
  PromoIcon,
  SingonioIcon,
  PotusIcon,
  MonsteraIcon,
  CalatheaIcon,
  MarantaIcon,
  PhilodendroIcon,
  AnturioIcon,
} from "../../assets/images";
import { Truck, Card, Plant } from "../../assets/icons";
import { useNavigate } from "react-router-dom";
import { ProductList } from "../../Components/mainLayout";
const categories = [
  { name: "Ofertas", icon: PromoIcon, path: "./categories/Ofertas" },
  { name: "Singonio", icon: SingonioIcon, path: "/categories/Singonio" },
  { name: "Potus", icon: PotusIcon, path: "/categories/Potus" },
  { name: "Monstera", icon: MonsteraIcon, path: "/categories/Monstera" },
  { name: "Maranta", icon: MarantaIcon, path: "/categories/Maranta" },
  { name: "Calathea", icon: CalatheaIcon, path: "/categories/Calathea" },
  {
    name: "Philodendro",
    icon: PhilodendroIcon,
    path: "/categories/Philodendro",
  },
  { name: "Anturio", icon: AnturioIcon, path: "/categories/Anturio" },
];
const features = [
  { name: "Envios a San Luis y Villa Mercedes", icon: Truck },
  { name: "Diferentes medios de pago", icon: Card },
  { name: "Cultivadas Localmente", icon: Plant },
];

export default function Home() {
  const navigate = useNavigate();

  const handleCategories = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <main className="bg-bg-light w-full flex flex-col items-center text-white">
      <section
        aria-label="Promoción destacada"
        className="relative isolate w-full h-70 overflow-hidden transparent md:aspect-[16/7]">
        <div className="bg-[linear-gradient(to_bottom,#A8C09A_0%,#A8C09A_40%,#F5F1E8_100%)] h-64 w-full absolute z-0"></div>
        <h1 className="absolute left-[7%] top-[14%] z-10 font-Outfit text-4xl font-bold leading-[0.9] text-primary-darkest">
          <span className="block pb-1">¡Ofertón</span>
          <span className="block">verde!</span>
        </h1>
        <img
          src={PotusPromo10Off}
          alt="Potus en maceta"
          className="absolute bottom-[0%] right-0 z-20 h-[90%] w-contain object-contain object-bottom md:right-[4%] md:h-[88%] md:w-[45%]"
        />
        <p className="absolute bottom-[35%] left-[7%] z-10 font-Outfit text-[clamp(1.1rem,3.2vw,2.5rem)] font-medium text-primary-darkest">
          Potus
        </p>
        <div className="absolute bottom-[10%] left-[4%] z-10 flex h-[20%] w-[70%] items-center gap-[3%] rounded-3xl bg-bg-light px-[6%] md:h-[17%] md:w-[52%] border border-primary-dark">
          <span className="font-Outfit text-3xl font-medium leading-none text-primary-darkest">
            $18.000
          </span>
          <span className="whitespace-nowrap font-outfit font-normal text-xm text-black/60 line-through">
            $20.000
          </span>
        </div>
      </section>
      <section className="flex overflow-x-auto scrollbar-none gap-6 sm:gap-8 w-full max-w-6xl h-fit px-4 py-3">
        {categories.map((category, index) => (
          <div
            key={index}
            className="flex shrink-0 flex-col items-center gap-1 cursor-pointer"
            onClick={() => {
              handleCategories(category.path);
            }}>
            <img
              src={category.icon}
              alt={category.name}
              className="w-20 h-20 object-contain"
            />
            <span className="text-sm font-Outfit text-black">
              {category.name}
            </span>
          </div>
        ))}
      </section>
      <section className="flex justify-around items-center w-full max-w-5xl min-h-36 py-6 px-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center w-30 h-30 gap-3">
            <feature.icon className="w-12 h-12" />
            <span className="text-xs font-Manrope text-black w-20">
              {feature.name}
            </span>
          </div>
        ))}
      </section>
      <section className="w-full">
        <ProductList family="AllPlants" />
      </section>
    </main>
  );
}
