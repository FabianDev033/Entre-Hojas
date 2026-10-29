import axios from "axios";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { Add, Trash } from "../../assets/icons";
import { LabelBadge } from "../common";
import { productImageUrl } from "../../utils/productImage";
import { productLabels } from "../../utils/productLabels";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const inputClass =
  "w-full min-w-0 border border-alt-dark/40 rounded-sm bg-bg-light px-3 py-2 text-sm focus:outline-none focus:none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
const textFields = [
  { name: "familia", label: "Familia", maxLength: 100 },
  { name: "origen", label: "Origen", maxLength: 100 },
  { name: "tipo", label: "Tipo", maxLength: 50 },
] as const;
const selectFields = [
  {
    name: "tamano",
    label: "Tamaño",
    options: ["Pequeño", "Mediano", "Grande"],
  },
  {
    name: "iluminacion",
    label: "Iluminación",
    options: ["Poca", "Media", "Mucha"],
  },
  {
    name: "resistencia",
    label: "Resistencia",
    options: ["Poca", "Media", "Mucha"],
  },
  {
    name: "cuidado",
    label: "Cuidados",
    options: ["Fácil", "Medio", "Difícil"],
  },
  { name: "petFriendly", label: "Apta para mascotas", options: ["Sí", "No"] },
] as const satisfies readonly {
  name: keyof Plant;
  label: string;
  options: readonly string[];
}[];

type PlantImage = { id: number; url: string; tipo: string };
export type Plant = {
  id: number;
  nombre: string;
  precio: number;
  discount: number;
  stock: number;
  habilitado: boolean;
  ventas: number;
  etiqueta: string | null;
  etiquetas: string[];
  familia: string | null;
  origen: string | null;
  tipo: string | null;
  iluminacion: string | null;
  resistencia: string | null;
  tamano: string | null;
  cuidado: string | null;
  petFriendly: boolean | null;
  descripcion: string | null;
  imagenes: PlantImage[];
};
type PendingImage = { file: File; preview: string };

function formValues(plant: Plant | null) {
  const selectedValue = (name: (typeof selectFields)[number]["name"]) => {
    const rawValue = plant?.[name];
    const value =
      typeof rawValue === "boolean"
        ? rawValue
          ? "Sí"
          : "No"
        : (rawValue?.trim() ?? "");
    const field = selectFields.find((option) => option.name === name)!;
    return (
      field.options.find(
        (option) =>
          option.localeCompare(value, "es", { sensitivity: "base" }) === 0,
      ) ?? value
    );
  };
  return {
    nombre: plant?.nombre ?? "",
    precio: plant ? String(plant.precio) : "",
    stock: String(plant?.stock ?? 0),
    habilitado: plant?.habilitado ?? true,
    discount: String(plant?.discount ?? 0),
    etiqueta: plant?.etiqueta ?? "",
    etiquetas: plant?.etiquetas ?? (plant?.etiqueta ? [plant.etiqueta] : []),
    familia: plant?.familia ?? "",
    origen: plant?.origen ?? "",
    tipo: plant?.tipo ?? "",
    iluminacion: selectedValue("iluminacion"),
    resistencia: selectedValue("resistencia"),
    tamano: selectedValue("tamano"),
    cuidado: selectedValue("cuidado"),
    petFriendly: selectedValue("petFriendly"),
    descripcion: plant?.descripcion ?? "",
  };
}

export default function ProductForm({ initialPlant }: { initialPlant?: Plant }) {
  const navigate = useNavigate();
  const [plant, setPlant] = useState(initialPlant ?? null);
  const [form, setForm] = useState(() => formValues(initialPlant ?? null));
  const [removedIds, setRemovedIds] = useState<number[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const previews = useRef(new Set<string>());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const isCreating = plant === null;
  const selectedLabel = productLabels.find(
    (option) => option.value === form.etiqueta,
  );

  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const change = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
    setSaved(false);
  };

  const toggleLabel = (label: string) => {
    setForm((current) => {
      const etiquetas = current.etiquetas.includes(label)
        ? current.etiquetas.filter((value) => value !== label)
        : [...current.etiquetas, label];
      const etiqueta = etiquetas.includes(current.etiqueta)
        ? current.etiqueta
        : (etiquetas[0] ?? "");
      return { ...current, etiquetas, etiqueta };
    });
    setSaved(false);
  };

  const addImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    setError(null);
    if (
      files.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size === 0 ||
          file.size > 5 * 1024 * 1024,
      )
    ) {
      setError("Usá imágenes JPG, PNG o WebP de hasta 5 MB cada una.");
      return;
    }
    if (pendingImages.length + files.length > 10) {
      setError("Podés agregar hasta 10 imágenes por guardado.");
      return;
    }
    const additions = files.map((file) => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      return { file, preview };
    });
    setPendingImages((current) => [...current, ...additions]);
    setSaved(false);
  };

  const removePending = (preview: string) => {
    URL.revokeObjectURL(preview);
    previews.current.delete(preview);
    setPendingImages((current) =>
      current.filter((image) => image.preview !== preview),
    );
    setSaved(false);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    setError(null);
    setSaved(false);
    if (!form.nombre.trim() || !form.precio.trim() || !form.discount.trim()) {
      setError("Completá nombre, precio y descuento.");
      return;
    }
    if (form.etiquetas.includes("oferta") && Number(form.discount) === 0) {
      setError("La etiqueta Oferta requiere un descuento mayor a cero.");
      return;
    }
    if (
      isCreating &&
      (!form.stock.trim() ||
        !Number.isInteger(Number(form.stock)) ||
        Number(form.stock) < 0 ||
        Number(form.stock) > 2_147_483_647)
    ) {
      setError("El stock inicial debe ser un entero entre 0 y 2147483647.");
      return;
    }
    const { stock, ...productData } = form;
    const body = new FormData();
    body.append(
      "datos",
      JSON.stringify({
        ...productData,
        ...(isCreating ? { stock: Number(stock) } : {}),
        precio: Number(form.precio),
        discount: Number(form.discount),
        petFriendly: form.petFriendly === "" ? null : form.petFriendly === "Sí",
        imagenesEliminadas: removedIds,
      }),
    );
    pendingImages.forEach(({ file }) => body.append("imagenes", file));
    setSaving(true);
    try {
      const { data } = isCreating
        ? await axios.post<Plant>(`${API_BASE_URL}/api/productos`, body, {
            withCredentials: true,
          })
        : await axios.patch<Plant>(
            `${API_BASE_URL}/api/productos/${plant.id}/edicion`,
            body,
            { withCredentials: true },
          );
      if (isCreating) {
        navigate("/admin/productos");
        return;
      }
      setPlant(data);
      setForm(formValues(data));
      setRemovedIds([]);
      previews.current.forEach((url) => URL.revokeObjectURL(url));
      previews.current.clear();
      setPendingImages([]);
      setSaved(true);
    } catch (saveError) {
      setError(
        axios.isAxiosError<{ error: string }>(saveError) &&
          saveError.response?.data.error
          ? saveError.response.data.error
          : isCreating
            ? "No se pudo crear el producto. Intentá nuevamente."
            : "No se pudieron guardar los cambios. Intentá nuevamente.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="product-form @container" onSubmit={(event) => void save(event)}>
      <header className="mb-6">
        <h1 className="font-Outfit text-3xl font-medium">
          {isCreating ? "Agregar producto" : "Editar producto"}
        </h1>
        <p className="mt-1 text-sm text-black/60">
          {plant
            ? `ID ${plant.id} · ${plant.nombre}`
            : "Completá los datos de la nueva planta."}
        </p>
      </header>
      <fieldset
        disabled={saving}
        className="grid min-w-0 gap-8 @3xl:grid-cols-2 disabled:opacity-70">
        <section className="min-w-0 flex flex-col gap-4">
          <h2 className="font-Outfit text-xl font-medium">
            Datos de la planta
          </h2>
          <label className="flex flex-col gap-1 text-sm">
            Nombre
            <input
              name="nombre"
              value={form.nombre}
              onChange={change}
              required
              maxLength={100}
              className={inputClass}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm">
              Precio ($)
              <input
                name="precio"
                type="number"
                min="0"
                max="99999999.99"
                step="0.01"
                required
                value={form.precio}
                onChange={change}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Descuento (%)
              <input
                name="discount"
                type="number"
                min={form.etiquetas.includes("oferta") ? 1 : 0}
                max="100"
                step="1"
                required
                value={form.discount}
                onChange={change}
                className={inputClass}
              />
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <fieldset>
              <legend className="text-sm">Etiquetas</legend>
              <p className="mt-1 mb-2 text-xs text-black/70">
                Podés marcar varias y elegir cuál mostrar en la tarjeta.
              </p>
              <div className="grid grid-cols-1 @md:grid-cols-2 gap-2">
                {productLabels.map((option) => (
                  <label
                    key={option.value}
                    title={option.help}
                    className={`flex items-center gap-2 rounded-sm border px-2 py-2 text-sm cursor-pointer ${form.etiquetas.includes(option.value) ? "border-alt-dark bg-bg-light text-alt-dark" : "border-black/15"}`}>
                    <input
                      type="checkbox"
                      checked={form.etiquetas.includes(option.value)}
                      onChange={() => toggleLabel(option.value)}
                      className="h-3.5 w-3.5 shrink-0 accent-alt-dark"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex flex-col gap-1 text-sm">
              Etiqueta visible en la tienda
              <select
                name="etiqueta"
                value={form.etiqueta}
                onChange={change}
                disabled={form.etiquetas.length === 0}
                className={`${inputClass} disabled:opacity-60 cursor-pointer`}
                aria-describedby="label-help">
                {form.etiquetas.length === 0 && (
                  <option value="">Sin etiquetas</option>
                )}
                {productLabels
                  .filter((option) => form.etiquetas.includes(option.value))
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </label>
            <p id="label-help" className="text-xs text-black/70">
              {selectedLabel?.help ??
                "Marcá las etiquetas que correspondan al producto."}
            </p>
            <LabelBadge label={form.etiqueta} />
          </div>
          <dl className="grid grid-cols-2 gap-4 rounded-sm bg-bg-light p-3 text-sm">
            <div>
              <dt className="text-black/60">
                {isCreating ? "Stock inicial" : "Stock disponible"}
              </dt>
              <dd className="mt-1">
                {isCreating ? (
                  <input
                    aria-label="Stock inicial"
                    name="stock"
                    type="number"
                    min="0"
                    max="2147483647"
                    step="1"
                    required
                    value={form.stock}
                    onChange={change}
                    className={inputClass}
                  />
                ) : (
                  plant.stock
                )}
              </dd>
            </div>
            <div>
              <dt className="text-black/60">Cantidad vendida</dt>
              <dd className="mt-1">{plant?.ventas ?? 0}</dd>
            </div>
          </dl>
          <div className="rounded-sm bg-bg-light p-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p id="availability-label" className="text-sm font-medium">Producto habilitado</p>
                <p className={`mt-1 text-xs ${form.habilitado ? "text-primary-dark" : "text-cancel"}`} aria-live="polite">
                  {form.habilitado ? "Habilitado" : "Deshabilitado · Se mostrará sin stock"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.habilitado}
                aria-labelledby="availability-label"
                aria-describedby="availability-help"
                onClick={() => {
                  setForm((current) => ({ ...current, habilitado: !current.habilitado }));
                  setSaved(false);
                }}
                className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 cursor-pointer transition-colors ${form.habilitado ? "bg-primary-dark" : "bg-black/30"}`}>
                <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${form.habilitado ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            <p id="availability-help" className="mt-3 text-xs text-black/70">
              Al deshabilitarlo, seguirá visible con la cinta Sin stock, pero no se podrá abrir ni comprar. Las unidades se conservan. El cambio se aplica al guardar.
            </p>
            {form.habilitado && Number(form.stock) === 0 && (
              <p className="mt-2 text-xs text-cancel">Sin unidades disponibles: se mostrará sin stock aunque esté habilitado.</p>
            )}
          </div>
          <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
            {textFields.map((field) => (
              <label
                key={field.name}
                className="flex min-w-0 flex-col gap-1 text-sm">
                {field.label}
                <input
                  name={field.name}
                  value={form[field.name]}
                  onChange={change}
                  maxLength={field.maxLength}
                  className={inputClass}
                />
              </label>
            ))}
            {selectFields.map((field) => (
              <label
                key={field.name}
                className="flex min-w-0 flex-col gap-1 text-sm">
                {field.label}
                <select
                  name={field.name}
                  value={form[field.name]}
                  onChange={change}
                  className={`${inputClass} cursor-pointer`}>
                  <option value="">Sin especificar</option>
                  {form[field.name] &&
                    !field.options.some(
                      (option) => option === form[field.name],
                    ) && (
                      <option value={form[field.name]} disabled>
                        Actual: {form[field.name]} (elegí una opción)
                      </option>
                    )}
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </section>
        <section className="min-w-0 flex flex-col gap-4">
          <h2 className="font-Outfit text-xl font-medium">Imágenes</h2>
          <p className="text-xs text-black/70">
            JPG, PNG o WebP, hasta 5 MB por imagen. Los cambios se aplican al
            guardar.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {(plant?.imagenes ?? [])
              .filter((image) => !removedIds.includes(image.id))
              .map((image) => (
                <figure
                  key={image.id}
                  className="relative min-w-0 rounded-sm bg-bg-light shadow-sm">
                  <img
                    src={productImageUrl(image.url)}
                    alt={`${plant?.nombre ?? form.nombre} — imagen ${image.id}`}
                    className="w-full aspect-square rounded-t-sm object-contain"
                  />
                  <figcaption className="px-2 py-1 text-xs text-black/60">
                    {image.tipo === "icon" ? "Catálogo" : "Detalle"}
                  </figcaption>
                  <button
                    type="button"
                    aria-label={`Quitar imagen ${image.id}`}
                    onClick={() => {
                      setRemovedIds((current) => [...current, image.id]);
                      setSaved(false);
                    }}
                    className="absolute right-2 top-2 rounded-sm bg-bg-light p-2 text-cancel shadow-sm cursor-pointer">
                    <Trash className="h-4 w-4" />
                  </button>
                </figure>
              ))}
            {pendingImages.map(({ preview, file }) => (
              <figure
                key={preview}
                className="relative min-w-0 rounded-sm bg-bg-light shadow-sm">
                <img
                  src={preview}
                  alt={`Vista previa de ${file.name}`}
                  className="w-full aspect-square rounded-t-sm object-contain"
                />
                <figcaption className="px-2 py-1 text-xs text-primary-dark">
                  Nueva imagen
                </figcaption>
                <button
                  type="button"
                  aria-label={`Quitar ${file.name}`}
                  onClick={() => removePending(preview)}
                  className="absolute right-2 top-2 rounded-sm bg-bg-light p-2 text-cancel shadow-sm cursor-pointer">
                  <Trash className="h-4 w-4" />
                </button>
              </figure>
            ))}
            <label className="flex aspect-square flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-alt-dark/50 bg-bg-light text-alt-dark cursor-pointer">
              <Add className="h-8 w-8" />
              <span className="text-sm">Agregar imágenes</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={addImages}
                aria-label="Agregar imágenes"
                className="sr-only"
              />
            </label>
          </div>
          {removedIds.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setRemovedIds([]);
                setSaved(false);
              }}
              className="self-start text-sm text-alt-dark underline cursor-pointer">
              Deshacer imágenes quitadas ({removedIds.length})
            </button>
          )}
        </section>
        <label className="flex flex-col gap-2 @3xl:col-span-2">
          <span className="font-Outfit text-xl font-medium">Descripción</span>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={change}
            rows={6}
            maxLength={20000}
            className={`${inputClass} resize-y`}
          />
        </label>
      </fieldset>
      <div className="mt-5 min-h-5 text-sm" aria-live="polite">
        {error && (
          <p role="alert" className="text-cancel">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="text-primary-dark">
            Cambios guardados.
          </p>
        )}
      </div>
      <div className="mt-3 mb-5 flex items-center gap-4 font-Outfit">
        <button
          type="submit"
          disabled={saving}
          className="rounded-sm bg-alt-dark px-5 py-2 text-white font-Outfit text-lg font-light shadow-sm disabled:opacity-50 cursor-pointer">
          {saving ? "Guardando..." : isCreating ? "Crear producto" : "Guardar cambios"}
        </button>
        {saving ? (
          <span className="text-sm text-black/50">Cancelar</span>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/admin/productos")}
            className="text-sm text-alt-dark cursor-pointer">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
