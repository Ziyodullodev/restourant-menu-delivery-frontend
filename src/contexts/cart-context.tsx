import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { IAddon } from "@/components/mock/mock";

export interface CartItem {
    id: string; // Unique cart item ID (e.g. "p1-cheese")
    productId: string; // Original product ID
    name: string;
    price: number;
    quantity: number;
    image: string;
    weight?: string;
    addons?: IAddon[];
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "id" | "quantity">) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "delivery_cart";

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        // Load cart from localStorage on init
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addItem = (item: Omit<CartItem, "id" | "quantity">) => {
        setItems((prev) => {
            // Generate a unique ID based on product ID and sorted addons
            const addonIds = item.addons?.map((a) => a.id).sort().join("-") || "";
            const uniqueId = `${item.productId}-${addonIds}`;

            const existingItem = prev.find((i) => i.id === uniqueId);

            if (existingItem) {
                return prev.map((i) =>
                    i.id === uniqueId ? { ...i, quantity: i.quantity + 1 } : i
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
            prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const value: CartContextType = {
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
