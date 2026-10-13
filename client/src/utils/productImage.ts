import * as Images from "../assets/images";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

export function productImageUrl(image: string | null | undefined): string | undefined {
  if (!image) return undefined;
  if (image.startsWith("/uploads/")) return `${API_BASE_URL}${image}`;
  if (/^https?:\/\//.test(image)) return image;
  return Images[image as keyof typeof Images];
}
