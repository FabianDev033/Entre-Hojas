export type SavedLocation = {
  address: string;
  details?: string;
  latitude?: number;
  longitude?: number;
  updatedAt: string;
};

type DeliveryCity = "Villa Mercedes" | "San Luis";

const DELIVERY_CITIES: Array<{
  name: DeliveryCity;
  latitude: number;
  longitude: number;
  radiusKm: number;
}> = [
  { name: "Villa Mercedes", latitude: -33.6757, longitude: -65.4617, radiusKm: 22 },
  { name: "San Luis", latitude: -33.3017, longitude: -66.3378, radiusKm: 25 },
];

const LOCATION_STORAGE_KEY = "entre-hojas:checkout-location";

export function readSavedLocation(): SavedLocation | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!value) return null;

    const location: unknown = JSON.parse(value);
    if (
      typeof location !== "object" ||
      location === null ||
      !("address" in location) ||
      typeof location.address !== "string"
    ) {
      return null;
    }

    return location as SavedLocation;
  } catch {
    return null;
  }
}

export function saveLocation(location: SavedLocation): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
}

export function formatLocation(location: SavedLocation): string {
  if (location.latitude === undefined || location.longitude === undefined) {
    return location.address;
  }

  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
}

export function getMapQuery(location: Pick<SavedLocation, "address" | "latitude" | "longitude">): string {
  if (location.latitude !== undefined && location.longitude !== undefined) {
    return `${location.latitude},${location.longitude}`;
  }

  return location.address;
}

export function getDeliveryCityFromAddress(address: string): DeliveryCity | null {
  const normalizedAddress = address
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-AR");

  if (normalizedAddress.includes("villa mercedes")) return "Villa Mercedes";
  if (normalizedAddress.includes("san luis")) return "San Luis";

  return null;
}

export function getDeliveryCityFromCoordinates(
  latitude: number,
  longitude: number,
): DeliveryCity | null {
  for (const city of DELIVERY_CITIES) {
    if (getDistanceInKm(latitude, longitude, city.latitude, city.longitude) <= city.radiusKm) {
      return city.name;
    }
  }

  return null;
}

function getDistanceInKm(
  firstLatitude: number,
  firstLongitude: number,
  secondLatitude: number,
  secondLongitude: number,
): number {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(secondLatitude - firstLatitude);
  const longitudeDelta = toRadians(secondLongitude - firstLongitude);
  const calculation =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(firstLatitude)) *
      Math.cos(toRadians(secondLatitude)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(calculation), Math.sqrt(1 - calculation));
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}
