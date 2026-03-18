import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { IApiCategory, IApiProduct } from "@/types/api.types";
import { fetchCategories, fetchProducts } from "@/services/api.service";
import { useAuth } from "./auth-context";

interface MenuContextType {
  categories: IApiCategory[];
  products: IApiProduct[];
  isLoading: boolean;
  error: string | null;
  /** Barcha mahsulotlarni kategoriya bo'yicha olish */
  getProductsByCategory: (categoryId: string) => IApiProduct[];
  /** Ma'lumotlarni qayta yuklash */
  refresh: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const { authData } = useAuth();
  const [categories, setCategories] = useState<IApiCategory[]>([]);
  const [products, setProducts] = useState<IApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    // Auth tayyor bo'lgunicha kutamiz
    if (!authData) return;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Categories va Products ni parallel yuklaymiz
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts(),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (err: unknown) {
        console.error("Menu load error:", err);
        const msg =
          err instanceof Error ? err.message : "Menu yuklanishida xatolik";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [authData, tick]);

  const getProductsByCategory = useCallback(
    (categoryId: string) => products.filter((p) => p.category === categoryId),
    [products],
  );

  return (
    <MenuContext.Provider
      value={{
        categories,
        products,
        isLoading,
        error,
        getProductsByCategory,
        refresh,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within a MenuProvider");
  return ctx;
}
