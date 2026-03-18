import {
  IApiCategory,
  IApiProduct,
  ICartSummary,
  IApiResponse,
  IApiCartItem,
  IApiOrder,
} from "@/types/api.types";

export type { ICartSummary };

const BASE_URL = "https://backend-v1.menio.uz/api";

const getAccessToken = (): string | null => {
  try {
    const raw = localStorage.getItem("auth_data");
    if (raw) {
      const data = JSON.parse(raw);
      return data?.access ?? null;
    }
  } catch {}
  return null;
};

const authHeaders = () => {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

// ─── 1. Kategoriyalar darakhti ───────────────────────────────────────────────

export const fetchCategories = async (
  branchId?: string,
): Promise<IApiCategory[]> => {
  const url = new URL(`${BASE_URL}/r-client/categories/`);
  if (branchId) url.searchParams.set("branch_id", branchId);

  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error(`Categories fetch failed: ${res.status}`);
  const data: IApiResponse<IApiCategory> = await res.json();
  return data.results; // Only returning results array
};

// ─── 2. Mahsulotlar ro'yxati ─────────────────────────────────────────────────

export const fetchProducts = async (params?: {
  category_id?: string;
  branch_id?: string;
}): Promise<IApiProduct[]> => {
  const url = new URL(`${BASE_URL}/r-client/products/`);
  if (params?.category_id)
    url.searchParams.set("category_id", params.category_id);
  if (params?.branch_id) url.searchParams.set("branch_id", params.branch_id);

  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
  const data: IApiResponse<IApiProduct> = await res.json();
  return data.results; // Only returning results array
};

// ─── 3. Savatcha qisqachasi ──────────────────────────────────────────────────

export const fetchCartSummary = async (): Promise<ICartSummary> => {
  const res = await fetch(`${BASE_URL}/r-client/cart-summary/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Cart summary fetch failed: ${res.status}`);
  return res.json();
};

// ─── 4. Savatcha boshqaruvi ───────────────────────────────────────────────────

/** Savatga maxsulot qo'shish */
export const createCartItem = async (data: {
  product: string;
  branch?: string;
  amount?: number;
  ingredients?: string[];
}): Promise<IApiCartItem> => {
  const res = await fetch(`${BASE_URL}/r-client/order/cart/create/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      ...data,
      amount: data.amount ?? 1,
    }),
  });

  if (!res.ok) {
    if (res.status === 400) {
      // Backend allaqachon mavjud bo'lsa 400 qaytaradi, lekin miqdorni o'zi oshiradi
      // Shuning uchun bu holatda error tashlamaymiz
      const errData = await res.json();
      return errData;
    }
    throw new Error(`Cart create failed: ${res.status}`);
  }
  return res.json();
};

/** Savatdagi element miqdorini o'zgartirish */
export const updateCartItem = async (
  cartId: string,
  amount: number,
): Promise<IApiCartItem> => {
  const res = await fetch(`${BASE_URL}/r-client/order/cart/${cartId}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error(`Cart update failed: ${res.status}`);
  return res.json();
};

/** Savatdan o'chirish */
export const deleteCartItem = async (cartId: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/r-client/order/cart/${cartId}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Cart delete failed: ${res.status}`);
};

/** Savatdagi barcha elementlarni olish */
export const fetchCartItems = async (): Promise<IApiCartItem[]> => {
  const res = await fetch(`${BASE_URL}/r-client/order/cart/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Cart list fetch failed: ${res.status}`);
  const data: IApiResponse<IApiCartItem> = await res.json();
  return data.results;
};
/** Savatdagi barcha elementlarni bir yo'la o'chirish (Bulk delete) */
export const deleteAllCartItems = async (): Promise<void> => {
  const res = await fetch(`${BASE_URL}/r-client/order/cart/delete_all/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  // Agar delete_all yo'q bo'lsa, 404 berishi mumkin, bu holda local o'chirish davom etadi
  if (!res.ok && res.status !== 404) {
    throw new Error(`Cart bulk delete failed: ${res.status}`);
  }
};

/** Buyurtma berish (Savatni buyurtmaga aylantirish) */
export const createOrder = async (data: {
  branch?: string | number;
  delivery_with:
    | "organization_delivery"
    | "other_delivery"
    | "take_away"
    | "in_restaurant";
  pay_with: "cash" | "card" | "click" | "payme" | "uzumbank" | string;
  user_adress?: string | null;
  restourant_session?: string | null;
  original_price: number;
  current_price: number;
}): Promise<any> => {
  const res = await fetch(`${BASE_URL}/r-client/order/order/create/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Order placement failed: ${res.status}`);
  return res.json();
};

/** Buyurtmalar tarixini olish */
export const fetchOrderHistory = async (params?: {
  branch?: string;
  page?: number;
}): Promise<IApiResponse<IApiOrder>> => {
  const url = new URL(`${BASE_URL}/r-client/order/order/history/`);
  if (params?.branch) url.searchParams.set("branch", params.branch);
  if (params?.page) url.searchParams.set("page", params.page.toString());

  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error(`Order history fetch failed: ${res.status}`);
  return res.json();
};

/** Buyurtma tafsilotlarini olish */
export const fetchOrderDetail = async (orderId: string | number): Promise<IApiOrder> => {
  const res = await fetch(`${BASE_URL}/r-client/order/order/${orderId}/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Order detail fetch failed: ${res.status}`);
  return res.json();
};
