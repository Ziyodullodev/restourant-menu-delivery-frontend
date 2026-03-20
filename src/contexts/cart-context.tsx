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
  deleteAllCartItems,
  createOrder,
} from "@/services/api.service";
import { useAuth } from "./auth-context";
import { useI18n } from "./i18n-context";
import { useTable } from "./table-context";

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
  placeOrder: (data?: {
    delivery_with?: "organization_delivery" | "other_delivery" | "take_away" | "in_restaurant";
    pay_with?: string;
    comment?: string;
  }) => Promise<void>;
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
        if (!Array.isArray(apiItems)) return;
        
        setItems((prevItems) => {
          const merged = [...prevItems];

          apiItems.forEach((apiItem) => {
            const prodId = typeof apiItem.product === 'string' ? apiItem.product : apiItem.product?.id;
            if (!prodId) return;

            const addonIds = Array.isArray(apiItem.ingredients)
              ? apiItem.ingredients.map((a: string | { id: string }) => typeof a === 'string' ? a : a.id).sort().join("-")
              : "";
            const uniqueId = addonIds ? `${prodId}-${addonIds}` : prodId;

            const existingIdx = merged.findIndex((i) => i.id === uniqueId);
            if (existingIdx >= 0) {
              merged[existingIdx] = {
                ...merged[existingIdx],
                backendId: apiItem.id,
                quantity: apiItem.amount,
              };
            } else {
              if (typeof apiItem.product === 'object' && apiItem.product !== null) {
                 merged.push({
                    id: uniqueId,
                    backendId: apiItem.id,
                    productId: prodId,
                    name: language === "uz" ? apiItem.product.name_uz : apiItem.product.name_ru || "Maxsulot",
                    price: apiItem.product.current_price || 0,
                    quantity: apiItem.amount,
                    image: apiItem.product.medium_image || apiItem.product.original_image || "",
                    addons: apiItem.ingredients as IApiAddon[],
                 });
              }
            }
          });

          // Optional: we don't drop items not present in backend immediately here to prevent flickering, 
          // but relying on backend ID makes it reliable.
          return merged;
        });
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
          branch: authData.session?.organization?.id,
          ingredients: item.addons?.map((a) => a.id),
        });
        // Backenddan kelgan haqiqiy ID ni saqlaymiz, faqatgina res.id bo'lsa
        if (res.id) {
          setItems((prev) =>
            prev.map((i) =>
              i.id === uniqueId ? { ...i, backendId: res.id } : i,
            ),
          );
        }
        // Summary ni yangilaymiz (badge ko'rinishi uchun)
        refreshCartSummary();
      } catch (error: unknown) {
        console.warn("API create note: Might already be in cart", error);
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
        refreshCartSummary();
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
        refreshCartSummary();
      } catch (error) {
        console.error("Cart quantity update error:", error);
      }
    } else if (authData && !backendId) {
      // Agar backendId bo'lmasa (masalan, hali create javobi kelmagan bo'lsa)
      // Bu holatda refetch qilish kerak yoki kutish kerak
      console.warn("Missing backendId for updateQuantity");
    }
  };

  const clearCart = async () => {
    const itemsToDelete = [...items];

    // Optimistik UI: Darhol lokalni tozalaymiz
    setItems([]);
    setCartSummary({});

    if (authData) {
      try {
        // Birinchi navbatda barcha elementlarni bir yo'la o'chirishga harakat qilamiz
        await deleteAllCartItems(authData.session?.organization?.id);
        refreshCartSummary();
      } catch (err) {
        console.warn("Bulk delete failed, falling back to individual deletes", err);
        // Agar bulk o'chirish o'xshamasa, elementma-element o'chiramiz
        if (itemsToDelete.length > 0) {
          try {
            await Promise.all(
              itemsToDelete
                .filter((i) => i.backendId)
                .map((i) => deleteCartItem(i.backendId!)),
            );
            refreshCartSummary();
          } catch (error) {
            console.error("Clear cart sequential error:", error);
          }
        }
      }
    }
  };

  const { tableNumber } = useTable();

  const placeOrder = async (orderData?: {
    delivery_with?: "organization_delivery" | "other_delivery" | "take_away" | "in_restaurant";
    pay_with?: string;
    comment?: string;
  }) => {
    if (!authData) return;
    try {
      await createOrder({
        branch: authData.session?.organization?.id,
        delivery_with: orderData?.delivery_with ?? (tableNumber ? "in_restaurant" : "take_away"),
        pay_with: orderData?.pay_with ?? "cash",
        restourant_session: authData.session?.session_id,
        user_adress: null, // Address ID agar delivery bo'lsa
        original_price: totalPrice, // Discount bo'lmasa ikkalasi bir xil
        current_price: totalPrice,
      });
      clearCart();
    } catch (error) {
      console.error("Place order error:", error);
      throw error;
    }
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
        placeOrder,
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
