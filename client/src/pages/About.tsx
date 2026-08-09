import Logo from "../assets/images/Logo.png";
import { useNavigate } from "react-router-dom";
import { Whatsapp, Instagram, Mail, Plants1, Plants2, Plants3, Plants4 } from "../assets/images";
export default function About() {
  const navigate = useNavigate();
  const plants = [
    Plants1,
    Plants2,
    Plants3,
    Plants4,
  ];
  const carouselPlants = [...plants, ...plants];

    return (
    <main className="min-h-[95svh] bg-bg-light flex flex-col items-center gap-3 relative">
        <header className="flex justify-center items-center relative h-12 z-10 font-Outfit font-normal text-4xl text-black bg-primary w-full">
            <img src={Logo} alt="Logo Entre Hojas" 
                className="max-w-10 h-10 cursor-pointer absolute left-1"
                onClick={() => navigate("/")}/>
            <span className="text-shadow-xs">Entre Hojas</span>
        </header>
      <div className="bg-[linear-gradient(to_bottom,#A8C09A_0%,#A8C09A_40%,#F5F1E8_100%)] h-63 w-screen absolute z-0"></div>
      <section className="relative flex flex-col justify-center items-center gap-10 z-20">
        <div className="w-11/12 pt-10 flex flex-col items-center gap-2 font-Manrope font-normal text-black text-sm">
            <span>En Entre Hojas cultivamos nuestras plantas con nuestras propias manos.</span>
            <span>Dedicamos tiempo y cuidado a cada una para que llegue a tu hogar en las mejores condiciones.</span>
        </div>
        <div className="w-11/12 flex flex-col items-center justify-center font-Outfit font-normal text-black text-xl">
            <span>Elegí tu planta</span>
            <span>Nosotros hacemos el resto</span>
        </div>
      </section>
      <section className="w-full h-50 overflow-hidden">
        <div className="flex w-max animate-scroll">
            {carouselPlants.map((plant, index) => (
            <div
                key={index}
                className="w-70 shrink-0 px-2"
            >
                <img
                src={plant}
                alt={`Planta ${index + 1}`}
                className="h-50 w-full rounded-md object-cover shadow-lg"
                />
            </div>
            ))}
        </div>
      </section>
      <section className="relative w-11/12 flex flex-col gap-3 items-start justify-start font-Manrope font-normal text-black text-md">
        <span className="font-Outfit font-normal text-3xl text-shadow-2xs">Contactanos</span>
        <div className="flex gap-3">
            <img src={Whatsapp} alt="whatsapp contact" className="h-8"/>
            <span>2657 20-2434</span>
        </div>
        <div className="flex gap-3">
            <img src={Instagram} alt="whatsapp contact" className="h-8"/>
            <span>Entre.Hojas</span>
        </div>
        <div className="flex gap-3">
            <img src={Mail} alt="whatsapp contact" className="h-8"/>
            <span>EntreHojas@gmail.com</span>
        </div>

      </section>
    </main>
  )
}
