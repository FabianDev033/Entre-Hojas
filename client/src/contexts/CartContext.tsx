import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  CART_STORAGE_KEY,
  type CartStorageItem,
  getCartItems,
  saveCartItems,
} from "../utils/cart";

interface CartContextType {
  cart: CartStorageItem[];
  totalItems: number;
  addItem: (plantId: number, quantity: number) => void;
  removeItem: (plantId: number) => void;
  clearCart: () => void;
  setQuantity: (plantId: number, quantity: number) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartStorageItem[]>(getCartItems);

  useEffect(() => {
    const syncCart = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) setCart(getCartItems());
    };

    window.addEventListener("storage", syncCart);
    return () => window.removeEventListener("storage", syncCart);
  }, []);

  const updateCart = useCallback((update: (items: CartStorageItem[]) => CartStorageItem[]) => {
    setCart((current) => {
      const next = update(current);
      saveCartItems(next);
      return next;
    });
  }, []);

  const addItem = useCallback((plantId: number, quantity: number) => {
    if (!Number.isInteger(plantId) || plantId <= 0 || !Number.isInteger(quantity) || quantity <= 0) return;

    updateCart((current) => {
      const existing = current.find((item) => item.plantId === plantId);
      return existing
        ? current.map((item) =>
          item.plantId === plantId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
        : [...current, { plantId, quantity }];
    });
  }, [updateCart]);

  const removeItem = useCallback((plantId: number) => {
    updateCart((current) => current.filter((item) => item.plantId !== plantId));
  }, [updateCart]);

  const clearCart = useCallback(() => {
    updateCart(() => []);
  }, [updateCart]);

  const setQuantity = useCallback((plantId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(plantId);
      return;
    }

    updateCart((current) =>
      current.map((item) =>
        item.plantId === plantId ? { ...item, quantity } : item,
      ),
    );
  }, [removeItem, updateCart]);

  const totalItems = cart.length;
  const value = useMemo(() => ({
    cart,
    totalItems,
    addItem,
    removeItem,
    clearCart,
    setQuantity,
  }), [addItem, cart, clearCart, removeItem, setQuantity, totalItems]);

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

// Context hooks must share this module with their provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }

  return context;
}
