type GoogleGeocodeResult = {
  formatted_address: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
};

type GoogleMapsApi = {
  maps: {
    Geocoder: new () => {
      geocode: (request: { address: string; region: string }) => Promise<{
        results: GoogleGeocodeResult[];
      }>;
    };
    places: {
      Autocomplete: new (
        input: HTMLInputElement,
        options: {
          componentRestrictions: { country: string };
          fields: string[];
          types: string[];
        },
      ) => {
        addListener: (eventName: "place_changed", handler: () => void) => {
          remove: () => void;
        };
        getPlace: () => GooglePlace;
      };
    };
  };
};

type GooglePlace = {
  formatted_address?: string;
  geometry?: GoogleGeocodeResult["geometry"];
};

declare global {
  interface Window {
    google?: GoogleMapsApi;
  }
}

let googleMapsPromise: Promise<GoogleMapsApi> | null = null;

function loadGoogleMaps(): Promise<GoogleMapsApi> {
  if (window.google?.maps?.Geocoder) return Promise.resolve(window.google);
  if (googleMapsPromise) return googleMapsPromise;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(
      new Error("Falta configurar la clave de Google Maps para buscar direcciones."),
    );
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&libraries=places&language=es&region=AR`;
    script.async = true;
    script.onload = () => {
      if (window.google?.maps?.Geocoder) {
        resolve(window.google);
      } else {
        reject(new Error("No se pudo inicializar Google Maps."));
      }
    };
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps."));
    document.head.append(script);
  });

  return googleMapsPromise;
}

export type GeocodedAddress = {
  formattedAddress: string;
  latitude: number;
  longitude: number;
};

export async function geocodeAddress(address: string): Promise<GeocodedAddress> {
  const google = await loadGoogleMaps();
  const response = await new google.maps.Geocoder().geocode({
    address,
    region: "AR",
  });
  const result = response.results[0];

  if (!result) {
    throw new Error("No encontramos esa dirección. Revisá calle, número y ciudad.");
  }

  return {
    formattedAddress: result.formatted_address,
    latitude: result.geometry.location.lat(),
    longitude: result.geometry.location.lng(),
  };
}

export async function attachAddressAutocomplete(
  input: HTMLInputElement,
  onPlaceSelected: (place: GeocodedAddress) => void,
): Promise<() => void> {
  const google = await loadGoogleMaps();
  const autocomplete = new google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: "ar" },
    fields: ["formatted_address", "geometry"],
    types: ["address"],
  });

  const listener = autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.formatted_address) return;

    onPlaceSelected({
      formattedAddress: place.formatted_address,
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
    });
  });

  return () => listener.remove();
}
