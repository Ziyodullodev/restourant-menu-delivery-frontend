import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { IApiAddon } from "@/types/api.types";
import {
  ICartSummary,
  fetchCartSummary,
  createCartItem,
  updateCartItem,
  deleteCartItem,
  fetchCartItems,
} from "@/services/api.service";
import { useAuth } from "./auth-context";
import { useI18n } from "./i18n-context";

export interface CartItem {
  id: string; // Unikal local ID: "productId-addon1-addon2"
  backendId?: string; // UUID from backend (cart_id)
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
  const { language } = useI18n();

  // Har cart o'zgarishda localStorage ga saqlaymiz (agar offline ishlatilsa)
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Auth tayyor bo'lgach cart-summary va to'liq cartni yuklaymiz
  const refreshCartSummary = useCallback(() => {
    setSummaryClock((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!authData) return;

    // Summary ni yuklash
    fetchCartSummary()
      .then(setCartSummary)
      .catch((err) => console.warn("Cart summary fetch error:", err));

    // To'liq cart elementlarini yuklash va lokalga map qilish
    fetchCartItems()
      .then((apiItems) => {
        const localItems: CartItem[] = apiItems.map((apiItem) => {
          const addonIds =
            apiItem.ingredients
              ?.map((a) => a.id)
              .sort()
              .join("-") ?? "";
          const uniqueId = addonIds
            ? `${apiItem.product.id}-${addonIds}`
            : apiItem.product.id;

          return {
            id: uniqueId,
            backendId: apiItem.id,
            productId: apiItem.product.id,
            name:
              language === "uz"
                ? apiItem.product.name_uz
                : apiItem.product.name_ru,
            price: apiItem.product.current_price, // Addonlar narxini ham backend berishi kerak, hozircha faqat product narxi
            quantity: apiItem.amount,
            image:
              apiItem.product.medium_image || apiItem.product.original_image,
            weight: apiItem.product.product_weight
              ? `${apiItem.product.product_weight} g`
              : "",
            addons: apiItem.ingredients,
          };
        });
        setItems(localItems);
      })
      .catch((err) => console.warn("Cart items fetch error:", err));
  }, [authData, summaryClock, language]);

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  const addItem = async (
    item: Omit<CartItem, "id" | "quantity" | "backendId">,
  ) => {
    const addonIds =
      item.addons
        ?.map((a) => a.id)
        .sort()
        .join("-") ?? "";
    const uniqueId = addonIds
      ? `${item.productId}-${addonIds}`
      : item.productId;

    // Optimistik UI: Darhol lokalga qo'shish
    setItems((prev) => {
      const existing = prev.find((i) => i.id === uniqueId);
      if (existing) {
        return prev.map((i) =>
          i.id === uniqueId ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, id: uniqueId, quantity: 1 }];
    });

    // Backend ga yuborish
    if (authData) {
      try {
        const res = await createCartItem({
          product: item.productId,
          amount: 1,
          ingredients: item.addons?.map((a) => a.id),
        });
        // Backenddan kelgan haqiqiy ID ni saqlaymiz
        setItems((prev) =>
          prev.map((i) =>
            i.id === uniqueId ? { ...i, backendId: res.id } : i,
          ),
        );
      } catch (error: unknown) {
        console.warn("API create note: Might already be in cart", error);
        // Documentation bo'yicha 400 bo'lsa ham backend +1 qilgan, shuning uchun error tashlamaymiz
        // Lekin backendId ni yangilash uchun refetch qilsak yaxshi bo'ladi
        refreshCartSummary();
      }
    }
  };

  const removeItem = async (id: string) => {
    const itemToRemove = items.find((i) => i.id === id);
    const backendId = itemToRemove?.backendId;

    // Optimistik UI: Darhol o'chirish
    setItems((prev) => prev.filter((item) => item.id !== id));

    // Backend dan o'chirish
    if (authData && backendId) {
      try {
        await deleteCartItem(backendId);
      } catch (error) {
        console.error("Cart item delete error:", error);
      }
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    const itemToUpdate = items.find((i) => i.id === id);
    const backendId = itemToUpdate?.backendId;

    // Optimistik UI
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );

    // Backend sync
    if (authData && backendId) {
      try {
        await updateCartItem(backendId, quantity);
      } catch (error) {
        console.error("Cart quantity update error:", error);
      }
    } else if (authData && !backendId) {
      // Agar backendId bo'lmasa (masalan, hali create javobi kelmagan bo'lsa)
      // Bu holatda refetch qilish kerak yoki kutish kerak
      console.warn("Missing backendId for updateQuantity");
    }
  };

  const clearCart = () => {
    // Hozircha backenda clearCart API yo'q bo'lsa, elementma-element o'chirish kerak yoki shunchaki lokal
    // Lekin user logout bo'lganda bu chaqiriladi
    setItems([]);
  };

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
