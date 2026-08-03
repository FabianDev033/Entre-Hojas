import { useState } from "react";
import { Close, Location } from "../../assets/icons";
import {
  getDeliveryCityFromAddress,
  getDeliveryCityFromCoordinates,
  getMapQuery,
  type SavedLocation,
} from "../../utils/location";

type LocationModalProps = {
  initialLocation: SavedLocation | null;
  onClose: () => void;
  onSave: (location: SavedLocation) => void;
};

const DEFAULT_MAP_QUERY = "-33.6757,-65.4617";

export default function LocationModal({
  initialLocation,
  onClose,
  onSave,
}: LocationModalProps) {
  const [address, setAddress] = useState(initialLocation?.address ?? "");
  const [details, setDetails] = useState(initialLocation?.details ?? "");
  const [mapQuery, setMapQuery] = useState(
    initialLocation ? getMapQuery(initialLocation) : DEFAULT_MAP_QUERY,
  );
  const [coordinates, setCoordinates] = useState<Pick<
    SavedLocation,
    "latitude" | "longitude"
  >>(
    initialLocation?.latitude !== undefined && initialLocation.longitude !== undefined
      ? { latitude: initialLocation.latitude, longitude: initialLocation.longitude }
      : {},
  );
  const [error, setError] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const showTypedAddress = () => {
    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      setError("Escribí una dirección para mostrarla en el mapa.");
      return;
    }

    if (!getDeliveryCityFromAddress(trimmedAddress)) {
      setError("Por ahora solo hacemos envíos en Villa Mercedes y San Luis.");
      return;
    }

    setCoordinates({});
    setMapQuery(trimmedAddress);
    setError("");
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Este dispositivo no permite obtener la ubicación actual.");
      return;
    }

    setIsLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const deliveryCity = getDeliveryCityFromCoordinates(
          coords.latitude,
          coords.longitude,
        );
        if (!deliveryCity) {
          setError("Por ahora solo hacemos envíos en Villa Mercedes y San Luis.");
          setIsLocating(false);
          return;
        }

        const nextCoordinates = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        setCoordinates(nextCoordinates);
        setAddress(`Ubicación actual, ${deliveryCity}`);
        setMapQuery(getMapQuery({ address: "", ...nextCoordinates }));
        setIsLocating(false);
      },
      () => {
        setError("No pudimos obtener tu ubicación. Revisá los permisos del navegador.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  };

  const saveSelectedLocation = () => {
    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      setError("Elegí tu ubicación actual o escribí una dirección antes de guardar.");
      return;
    }

    const deliveryCity =
      coordinates.latitude !== undefined && coordinates.longitude !== undefined
        ? getDeliveryCityFromCoordinates(coordinates.latitude, coordinates.longitude)
        : getDeliveryCityFromAddress(trimmedAddress);

    if (!deliveryCity) {
      setError("Por ahora solo hacemos envíos en Villa Mercedes y San Luis.");
      return;
    }

    onSave({
      address: trimmedAddress,
      details: details.trim() || undefined,
      ...coordinates,
      updatedAt: new Date().toISOString(),
    });
  };

  const mapUrl = `https://www.google.com/maps?output=embed&q=${encodeURIComponent(mapQuery)}`;

  return (
    <div
      className="fixed top-0 h-screen w-screen z-30 backdrop-blur-[1px] bg-black/75 flex flex-col justify-end"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative h-10/12 w-screen overflow-y-auto bg-bg-dark flex flex-col gap-4 items-center rounded-t-md pb-5"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
      >
        <button
          className="absolute -top-8 right-2 cursor-pointer"
          onClick={onClose}
          aria-label="Cerrar selector de ubicación"
        >
          <Close className="text-bg" />
        </button>
        <section className="mt-4 w-11/12 flex flex-col gap-3 text-black font-normal">
          <h2 id="location-modal-title" className="font-Outfit text-lg">
            Elegí tu ubicación
          </h2>
          <div className="h-52 w-full overflow-hidden rounded-sm shadow-md bg-alt-faded/20">
            <iframe
              className="h-full w-full border-0"
              title="Mapa de la ubicación seleccionada"
              src={mapUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <button
            type="button"
            className="h-10 rounded-sm bg-primary text-white font-Manrope text-sm cursor-pointer disabled:cursor-wait disabled:opacity-70"
            onClick={useCurrentLocation}
            disabled={isLocating}
          >
            {isLocating ? "Buscando tu ubicación..." : "Usar mi ubicación actual"}
          </button>
          <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); showTypedAddress(); }}>
            <label className="relative flex items-center flex-1">
              <Location className="absolute left-3 h-5" />
              <input
                type="text"
                value={address}
                onChange={(event) => {
                  setAddress(event.target.value);
                  setCoordinates({});
                }}
                placeholder="Calle, número, ciudad"
                className="font-Manrope font-light text-sm border border-alt-faded rounded-sm focus:outline-none h-10 px-10 w-full shadow-sm"
              />
            </label>
            <button
              type="submit"
              className="rounded-sm border border-primary px-3 text-primary font-Manrope text-sm cursor-pointer"
            >
              Ver mapa
            </button>
          </form>
          {error && <p className="font-Manrope text-xs text-red-700">{error}</p>}
          <p className="font-Manrope text-xs text-black/60">
            Hacemos envíos únicamente en Villa Mercedes y San Luis.
          </p>
        </section>
        <section className="w-11/12 flex flex-col gap-3">
          <label className="flex flex-col gap-1 font-Manrope text-sm text-black">
            Detalles opcionales
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Ej.: departamento, piso, entre calles o indicaciones de entrega"
              className="min-h-20 resize-y rounded-sm border border-alt-faded px-3 py-2 font-light shadow-sm focus:outline-none"
              maxLength={250}
            />
          </label>
          <button
            type="button"
            className="h-10 rounded-sm bg-primary-dark text-white font-Manrope text-sm cursor-pointer"
            onClick={saveSelectedLocation}
          >
            Guardar ubicación
          </button>
        </section>
      </div>
    </div>
  );
}
