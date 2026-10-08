import axios from "axios";
import { useEffect, useId, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "../../assets/icons";
import { filterPlants } from "../../utils/productSearch";
import type { Plant } from "../mainLayout/ProductList";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function ProductSearch() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [plants, setPlants] = useState<Plant[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    axios.get<Plant[]>(`${API_BASE_URL}/api/plantas/familia/AllPlants`, {
      signal: controller.signal,
    }).then(({ data }) => setPlants(data)).catch((requestError) => {
      if (!axios.isCancel(requestError)) setError(true);
    });
    return () => controller.abort();
  }, []);

  return <SearchForm key={`${pathname}:${query}`} initialQuery={query} plants={plants} error={error} />;
}

function SearchForm({ initialQuery, plants, error }: {
  initialQuery: string;
  plants: Plant[] | null;
  error: boolean;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const suggestionsId = useId();
  const suggestions = filterPlants(plants ?? [], query).slice(0, 5);
  const showSuggestions = isOpen && query.trim().length > 0;

  return (
    <form
      role="search"
      className="relative justify-self-center flex items-center w-55 h-8 bg-bg-light rounded-md shadow-md"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false);
      }}
      onSubmit={(event) => {
        event.preventDefault();
        const value = query.trim();
        const search = new URLSearchParams();
        if (value) search.set("q", value);
        setIsOpen(false);
        navigate({ pathname: "/categories/Todo", search: search.toString() });
      }}
    >
      <input
        type="search"
        name="q"
        value={query}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        autoComplete="off"
        aria-controls={showSuggestions ? suggestionsId : undefined}
        aria-label="Buscar plantas"
        className="min-w-0 flex-1 ml-2 text-[0.625rem] focus:outline-none"
        placeholder="Buscar Entre Hojas"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="w-8 h-full shrink-0 bg-bg flex justify-center items-center rounded-r-md cursor-pointer"
      >
        <Search className="w-5 h-5" />
      </button>
      {showSuggestions && (
        <div
          id={suggestionsId}
          className="absolute top-full left-0 z-30 mt-1 w-full max-h-80 overflow-y-auto rounded-md border border-black/10 bg-bg-light text-black shadow-lg"
        >
          {error ? (
            <p className="p-3 font-Manrope text-xs" role="status">No pudimos cargar las sugerencias. Podés intentar con Buscar.</p>
          ) : plants === null ? (
            <p className="p-3 font-Manrope text-xs" role="status">Buscando plantas...</p>
          ) : suggestions.length === 0 ? (
            <p className="p-3 font-Manrope text-xs" role="status">No encontramos plantas.</p>
          ) : (
            <ul aria-label="Plantas sugeridas">
              {suggestions.map((plant) => (
                <li key={plant.id}>
                  <Link
                    to={`/detalle/${plant.id}`}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 font-Manrope text-sm hover:bg-bg-dark focus:bg-bg-dark focus:outline-none"
                  >
                    {[plant.family, plant.name].filter(Boolean).join(" ")}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <button type="submit" className="w-full border-t border-black/10 px-3 py-2 text-left font-Manrope text-xs text-primary-dark hover:bg-bg-dark focus:bg-bg-dark cursor-pointer">
            Ver todos los resultados
          </button>
        </div>
      )}
    </form>
  );
}
