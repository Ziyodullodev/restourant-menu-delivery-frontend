import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { IApiAddon } from "@/types/api.types";
import { ICartSummary, fetchCartSummary } from "@/services/api.service";
import { useAuth } from "./auth-context";

export interface CartItem {
  id: string; // Unikal cart item ID: "productId-addon1-addon2"
  productId: string; // Backend product UUID
  name: string;
  price: number;
  quantity: number;
  image: string;
  weight?: string;
  addons?: IApiAddon[];
}

interface CartContextType {
  items: CartItem[];
  /** Backend dan kelgan { productId: quantity } xaritasi */
  cartSummary: ICartSummary;
  addItem: (item: Omit<CartItem, "id" | "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  /** cart-summary ni backend dan qayta yuklash */
  refreshCartSummary: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "delivery_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const { authData } = useAuth();

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cartSummary, setCartSummary] = useState<ICartSummary>({});
  const [summaryClock, setSummaryClock] = useState(0);

  // Har cart o'zgarishda localStorage ga saqlaymiz
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Auth tayyor bo'lgach cart-summary ni yuklaymiz
  const refreshCartSummary = useCallback(() => {
    setSummaryClock((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!authData) return;
    fetchCartSummary()
      .then(setCartSummary)
      .catch((err) => console.warn("Cart summary fetch error:", err));
  }, [authData, summaryClock]);

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  const addItem = (item: Omit<CartItem, "id" | "quantity">) => {
    setItems((prev) => {
      const addonIds =
        item.addons
          ?.map((a) => a.id)
          .sort()
          .join("-") ?? "";
      const uniqueId = addonIds
        ? `${item.productId}-${addonIds}`
        : item.productId;

      const existing = prev.find((i) => i.id === uniqueId);
      if (existing) {
        return prev.map((i) =>
          i.id === uniqueId ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, id: uniqueId, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        cartSummary,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        refreshCartSummary,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
