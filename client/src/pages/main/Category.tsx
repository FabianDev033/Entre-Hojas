import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Plant } from "../../Components/mainLayout/ProductList";
import { LeafCategory } from "../../assets/icons";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const families = [
  { name: "Anturio", color: "bg-primary/25" },
  { name: "Calathea", color: "bg-secondary/25" },
  { name: "Maranta", color: "bg-alt/20" },
  { name: "Monstera", color: "bg-primary/25" },
  { name: "Philodendro", color: "bg-secondary/25" },
  { name: "Potus", color: "bg-primary/25" },
  { name: "Singonio", color: "bg-secondary/25" },
];

export default function Category() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[] | null>(null);
  const [countsError, setCountsError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get<Plant[]>(`${API_BASE_URL}/api/plantas/familia/AllPlants`, {
        signal: controller.signal,
      })
      .then(({ data }) => setPlants(data))
      .catch((error: unknown) => {
        if (!axios.isCancel(error)) setCountsError(true);
      });

    return () => controller.abort();
  }, []);

  const countFamily = (family: string) =>
    plants?.filter((plant) => plant.family === family).length;
  const offerCount = plants?.filter((plant) =>
    (plant.labels ?? [plant.label]).includes("oferta"),
  ).length;

  const handleNavigate = (name: string) => navigate(`/categories/${name}`);
  const formatCount = (amount: number | undefined) => {
    if (amount === undefined) return "…";
    return `${amount} ${amount === 1 ? "variedad" : "variedades"}`;
  };

  return (
    <main className="min-h-[calc(100svh-64px)] w-full bg-bg-light font-Outfit text-black">
      <section className="mx-auto w-full max-w-6xl px-4 pt-4 pb-28 sm:px-6 sm:pt-5">
        <h1 className="mb-3 text-3xl font-semibold leading-tight sm:mb-4 sm:text-4xl">
          Categorías
        </h1>

        {countsError && (
          <p className="mb-3 font-Manrope text-sm text-black/70" role="status">
            No pudimos actualizar las cantidades.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => handleNavigate("Ofertas")}
            aria-label={`Ofertas, ${formatCount(offerCount)}`}
            className="col-span-2 flex min-h-24 items-center justify-between gap-3 rounded-2xl bg-alt/25 px-4 py-3 text-left transition hover:bg-alt/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alt-dark sm:min-h-28 sm:px-5"
          >
            <span className="text-xl font-semibold sm:text-2xl">Ofertas</span>
            <span className="shrink-0 rounded-full bg-bg-light px-3 py-1.5 font-Manrope text-xs text-black/80 sm:text-sm">
              {formatCount(offerCount)}
            </span>
          </button>

          {families.map(({ name, color }) => {
            const amount = countFamily(name);
            return (
              <button
                type="button"
                key={name}
                onClick={() => handleNavigate(name)}
                aria-label={`${name}, ${formatCount(amount)}`}
                className={`flex min-h-28 flex-col items-start justify-end gap-0.5 rounded-2xl ${color} p-3 text-left transition hover:brightness-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alt-dark sm:min-h-32 sm:p-4`}
              >
                <span className="mb-auto self-end">
                  <LeafCategory aria-hidden="true" className="h-6 w-6 text-black/55" />
                </span>
                <span className="text-lg font-semibold leading-tight sm:text-xl">
                  {name}
                </span>
                <span className="font-Manrope text-xs text-black/80 sm:text-sm">
                  {formatCount(amount)}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => handleNavigate("Todo")}
            aria-label={`Todo, ${formatCount(plants?.length)}`}
            className="flex min-h-28 flex-col justify-end gap-0.5 rounded-2xl bg-primary-dark p-3 text-left text-bg-light transition hover:bg-primary-dark/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alt-dark sm:min-h-32 sm:p-4"
          >
            <span className="text-lg font-semibold leading-tight sm:text-xl">
              Todo
            </span>
            <span className="font-Manrope text-xs text-bg-light/85 sm:text-sm">
              {formatCount(plants?.length)}
            </span>
          </button>
        </div>
      </section>
    </main>
  );
}
