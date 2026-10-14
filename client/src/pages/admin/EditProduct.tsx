import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductForm, { type Plant } from "../../Components/admin/ProductForm";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function EditProduct() {
  const { id } = useParams();
  return <ProductEditor key={id} id={id ?? ""} />;
}

function ProductEditor({ id }: { id: string }) {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get<Plant>(
        `${API_BASE_URL}/api/productos/${encodeURIComponent(id ?? "")}/edicion`,
        {
          withCredentials: true,
          signal: controller.signal,
        },
      )
      .then(({ data }) => setPlant(data))
      .catch((requestError) => {
        if (!axios.isCancel(requestError)) {
          setError(
            axios.isAxiosError(requestError) &&
              requestError.response?.status === 404
              ? "No se encontró la planta."
              : "No se pudo cargar el producto. Intentá nuevamente.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  return (
    <main className="h-svh overflow-y-auto overscroll-y-contain bg-bg-dark px-6 py-5 text-black font-Manrope">
      <div className="w-full max-w-[86.4rem]">
        {loading && <p role="status">Cargando producto...</p>}
        {error && (
          <p role="alert" className="text-cancel">
            {error}
          </p>
        )}
        {!loading && plant && (
          <ProductForm key={plant.id} initialPlant={plant} />
        )}
      </div>
    </main>
  );
}
