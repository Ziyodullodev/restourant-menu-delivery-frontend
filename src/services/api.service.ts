import {
  IApiCategory,
  IApiProduct,
  ICartSummary,
  IApiResponse,
  IApiCartItem,
  IApiOrder,
  IApiBranch,
  IUserAddress,
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

const syncSessionFromResponse = (json: any) => {
  if (json && typeof json === "object") {
    const newSessionId =
      json.restourant_session || json.session_id || json.session?.id;
    const organization = json.organization || json.session?.restourant;
    
    const raw = localStorage.getItem("auth_data");
    if (raw) {
      try {
        const parsedData = JSON.parse(raw);
        let changed = false;

        if (newSessionId && parsedData.session_id !== newSessionId) {
          parsedData.session_id = newSessionId;
          changed = true;
        }

        if (organization && JSON.stringify(parsedData.organization) !== JSON.stringify(organization)) {
          parsedData.organization = organization;
          changed = true;
        }

        if (changed) {
          if (json.session) parsedData.session = json.session;
          localStorage.setItem("auth_data", JSON.stringify(parsedData));
          window.dispatchEvent(new Event("auth_data_updated"));
        }
      } catch (e) {}
    }
  }
};

// ─── 1. Kategoriyalar darakhti ───────────────────────────────────────────────

export const fetchCategories = async (
  branchId?: string,
): Promise<IApiCategory[]> => {
  const url = new URL(`${BASE_URL}/r-client/categories/`);
  if (branchId) url.searchParams.set("branch_id", branchId);

  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error(`Categories fetch failed: ${res.status}`);
  const resData = await res.json();
  syncSessionFromResponse(resData);
  return resData.results; // Only returning results array
};

// ─── 1.1 Filiallar ro'yxati ────────────────────────────────────────────────
export const fetchBranches = async (
  branchId?: string,
): Promise<IApiBranch[]> => {
  const url = new URL(`${BASE_URL}/r-client/branches/`);
  if (branchId) url.searchParams.set("branch_id", branchId);

  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error(`Branches fetch failed: ${res.status}`);
  const resData = await res.json();
  syncSessionFromResponse(resData);
  return resData.results || resData;
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
  const resData = await res.json();
  syncSessionFromResponse(resData);
  return resData.results; // Only returning results array
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
export const createCartItem = async (payload: {
  product: string;
  branch?: string;
  amount?: number;
  ingredients?: string[];
}): Promise<IApiCartItem> => {
  const res = await fetch(`${BASE_URL}/r-client/order/cart/create/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      ...payload,
      amount: payload.amount ?? 1,
    }),
  });

  if (!res.ok) {
    if (res.status === 400) {
      // Backend allaqachon mavjud bo'lsa 400 qaytaradi, lekin miqdorni o'zi oshiradi
      // Shuning uchun bu holatda error tashlamaymiz
      const errData = await res.json();
      syncSessionFromResponse(errData);
      return errData as IApiCartItem;
    }
    throw new Error(`Cart create failed: ${res.status}`);
  }
  const resData = await res.json();
  syncSessionFromResponse(resData);
  return resData as IApiCartItem;
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
  const data = await res.json();
  syncSessionFromResponse(data);
  return data;
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
  const res = await fetch(`${BASE_URL}/r-client/order/cart/list/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Cart list fetch failed: ${res.status}`);
  const data = await res.json();
  return data.results || data;
};
/** Savatdagi barcha elementlarni bir yo'la o'chirish (Bulk delete) */
export const deleteAllCartItems = async (branch?: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/r-client/order/cart/delete_all/`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ branch_id: branch }),
  });
  // Agar delete_all yo'q bo'lsa (404), throw error qilsinki front-end dagi fallback (birma-bir o'chirish) ishlasin
  if (!res.ok) {
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
  order_phone_number?: string;
  comment?: string;
}): Promise<IApiOrder> => {
  const res = await fetch(`${BASE_URL}/r-client/order/order/create/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Order placement failed: ${res.status}`);
  const resData = await res.json();
  syncSessionFromResponse(resData);
  return resData;
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

/** Buyurtmani bekor qilish */
export const cancelOrder = async (orderId: string | number, reason: string): Promise<IApiOrder> => {
  const res = await fetch(`${BASE_URL}/r-client/order/order/${orderId}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({
      status: "client_canceled",
      cancel_context: reason,
    }),
  });
  if (!res.ok) throw new Error(`Order cancellation failed: ${res.status}`);
  return res.json();
};

/** Fikr-mulohaza qoldirish */
export const createFeedback = async (data: {
  branch: string;
  star_rating: number;
  categories: string[];
  comment: string;
}): Promise<void> => {
  const res = await fetch(`${BASE_URL}/r-client/feedback/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Feedback submission failed: ${res.status}`);
};

/** User manzillari ro'yxatini olish */
export const fetchUserAddresses = async (): Promise<IUserAddress[]> => {
  const res = await fetch(`${BASE_URL}/r-admin/user-address/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`User addresses fetch failed: ${res.status}`);
  return res.json();
};

/** Yangi manzil saqlash */
export const createUserAddress = async (data: {
  address_name: string;
  latitude: string;
  longitude: string;
}): Promise<IUserAddress> => {
  const res = await fetch(`${BASE_URL}/r-admin/user-address/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`User address creation failed: ${res.status}`);
  return res.json();
};
