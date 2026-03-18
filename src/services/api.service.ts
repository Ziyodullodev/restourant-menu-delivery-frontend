import {
  IApiCategory,
  IApiProduct,
  ICartSummary,
  IApiResponse,
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
