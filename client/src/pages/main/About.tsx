import { useNavigate } from "react-router-dom";
import {
  Whatsapp,
  Instagram,
  Mail,
  Plants1,
  Plants2,
  Plants3,
  Plants4,
  Logo,
} from "../../assets/images";

const plants = [Plants1, Plants2, Plants3, Plants4];

const contacts = [
  { label: "WhatsApp", value: "2657 20-2434", icon: Whatsapp },
  { label: "Instagram", value: "Entre.Hojas", icon: Instagram },
  { label: "Correo electrónico", value: "EntreHojas@gmail.com", icon: Mail },
];

export default function About() {
  const navigate = useNavigate();
  const carouselPlants = [...plants, ...plants];

  return (
    <main className="flex min-h-[calc(100svh-3.75rem)] w-full flex-col items-center gap-7 bg-bg-dark px-4 pb-28 pt-6 text-black sm:gap-9 sm:pt-8">
      <section className="flex w-full max-w-3xl flex-col items-center gap-4 text-center">
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="Ir al inicio"
          className="flex size-16 items-center justify-center rounded-full bg-primary/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary">
          <img src={Logo} alt="" className="size-9 object-contain" />
        </button>
        <h1 className="font-Outfit text-2xl font-semibold sm:text-3xl">
          Entre Hojas
        </h1>
        <div
          className="h-1 w-12 rounded-full bg-secondary"
          aria-hidden="true"
        />
        <div className="flex max-w-2xl flex-col gap-2 font-Manrope text-base leading-relaxed text-black/85 sm:text-base">
          <p>
            En Entre Hojas cultivamos nuestras plantas con nuestras propias
            manos.
          </p>
          <p>
            Dedicamos tiempo y cuidado a cada una para que llegue a tu hogar en
            las mejores condiciones.
          </p>
        </div>
      </section>

      <section
        aria-label="Plantas de Entre Hojas"
        className="w-full max-w-5xl overflow-hidden">
        <div className="flex w-max animate-scroll">
          {carouselPlants.map((plant, index) => (
            <div
              key={`${index}-${plant}`}
              className="w-56 shrink-0 px-2 sm:w-72">
              <img
                src={plant}
                alt={`Planta de Entre Hojas ${(index % plants.length) + 1}`}
                className="h-40 w-full rounded-xl object-cover shadow-sm sm:h-52"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-2 text-center font-Outfit text-2xl font-medium leading-snug">
        <span>Elegí tu planta</span>
        <span className="text-secondary">Nosotros hacemos el resto.</span>
      </div>

      <section className="w-full max-w-2xl rounded-2xl border border-secondary/20 px-5 py-4 shadow-sm sm:px-7 sm:py-5">
        <h2 className="mb-2 font-Outfit text-lg font-medium sm:text-xl">
          Contactanos
        </h2>
        <ul>
          {contacts.map(({ label, value, icon }, index) => (
            <li
              key={label}
              className={`flex min-h-12 items-center gap-3 py-3 font-Manrope text-sm sm:text-base ${
                index < contacts.length - 1 ? "border-b border-black/20" : ""
              }`}>
              <img
                src={icon}
                alt=""
                aria-hidden="true"
                className="size-6 shrink-0 object-contain"
              />
              <span className="sr-only">{label}: </span>
              <span className="break-all">{value}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
