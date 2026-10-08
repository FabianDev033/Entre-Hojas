import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type Product = {
  id: number;
  nombre: string;
  categoria: string | null;
  stock: number;
  precio: number;
  discount: number;
  ventas: number;
};

type ProductsContextValue = {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  addStock: (id: number, amount: number) => Promise<void>;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<Product[]>(
        `${API_BASE_URL}/api/productos/inventario`,
        { withCredentials: true },
      );
      setProducts(response.data);
    } catch {
      setError("No se pudieron cargar los productos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  const addStock = useCallback(async (id: number, amount: number) => {
    if (!Number.isSafeInteger(amount) || amount < 1) {
      throw new Error("La cantidad a agregar debe ser un entero positivo.");
    }
    const response = await axios.patch<{ stock: number }>(
      `${API_BASE_URL}/api/productos/${id}/stock`,
      { cantidad: amount },
      { withCredentials: true },
    );
    setProducts((current) => current.map((product) =>
      product.id === id ? { ...product, stock: Number(response.data.stock) } : product,
    ));
  }, []);

  const value = useMemo(
    () => ({ products, isLoading, error, refreshProducts, addStock }),
    [products, isLoading, error, refreshProducts, addStock],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error("useProducts debe usarse dentro de ProductsProvider");
  return context;
}
