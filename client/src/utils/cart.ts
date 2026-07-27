export interface CartStorageItem {
  plantId: number;
  quantity: number;
}

export const CART_STORAGE_KEY = "entre-hojas-cart";

function isCartStorageItem(value: unknown): value is CartStorageItem {
  if (!value || typeof value !== "object") return false;

  const item = value as CartStorageItem;
  return (
    Number.isInteger(item.plantId) &&
    item.plantId > 0 &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

function normalizeCart(items: CartStorageItem[]): CartStorageItem[] {
  const quantities = new Map<number, number>();

  items.forEach(({ plantId, quantity }) => {
    quantities.set(plantId, (quantities.get(plantId) ?? 0) + quantity);
  });

  return Array.from(quantities, ([plantId, quantity]) => ({ plantId, quantity }));
}

export function getCartItems(): CartStorageItem[] {
  if (typeof window === "undefined") return [];

  try {
    const storedCart: unknown = JSON.parse(
      window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]",
    );

    if (!Array.isArray(storedCart)) return [];
    return normalizeCart(storedCart.filter(isCartStorageItem));
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartStorageItem[]) {
  window.localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify(normalizeCart(items.filter(isCartStorageItem))),
  );
}

export function addToCart(plantId: number, quantity: number) {
  const currentItems = getCartItems();
  saveCartItems([...currentItems, { plantId, quantity }]);
}

