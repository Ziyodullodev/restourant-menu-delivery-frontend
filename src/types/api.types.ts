// ─── Pagination Wrapper ─────────────────────────────────────────────────────

export interface IApiResponse<T> {
  count: number;
  pages: number;
  results: T[];
}

// ─── Category Types ─────────────────────────────────────────────────────────

export interface IApiCategory {
  id: string;
  parent_category: string | null;
  name_uz: string;
  name_ru: string;
  name_en: string | null;
  image: string; // "https://..."
  children: IApiCategory[];
}

// ─── Product Types ───────────────────────────────────────────────────────────

export interface IApiAddon {
  id: string;
  name_uz: string;
  name_ru: string;
  name_en: string | null;
  price: number;
}

export interface IApiProduct {
  id: string;
  category: string; // category id
  name_uz: string;
  name_ru: string;
  name_en: string | null;
  original_image: string;
  medium_image: string;
  small_image: string;
  current_price: number;
  description_uz: string;
  description_ru: string;
  description_en: string | null;
  product_star: number;
  product_weight: number; // e.g. 0
  estimate_time: number; // e.g. 4
  product_discount: Record<string, unknown>;
  addons?: IApiAddon[];
}

// ─── Cart Summary ────────────────────────────────────────────────────────────

export type ICartSummary = Record<string, number>;

export interface IApiCartItem {
  id: string; // Backend cart_id (UUID)
  product: IApiProduct | string;
  branch?: string;
  amount: number;
  ingredients?: IApiAddon[] | string[];
}

// ─── Order Types ─────────────────────────────────────────────────────────────

export type OrderStatus =
  | "new"
  | "restourant_accepted"
  | "cooking"
  | "coked"
  | "delivering"
  | "delivered"
  | "restourant_canceled"
  | "client_canceled"
  | "completed";

export interface IApiOrderItem {
  id: number;
  product: {
    id: string | number;
    name_uz: string;
    name_ru?: string;
    name_en?: string;
    current_price: number;
    small_image: string;
  };
  amount: number;
  created_at: string;
  ingredients: IApiAddon[];
}

export interface IApiOrder {
  id: string | number;
  organization_branches: number | string;
  status: OrderStatus;
  status_display: string;
  original_price: number;
  current_price: number;
  items: IApiOrderItem[];
  created_at: string;
  delivery_with?: "organization_delivery" | "other_delivery" | "take_away" | "in_restaurant";
  pay_with?: "cash" | "card" | "click" | "payme" | "uzumbank" | string;
  user_adress?: string | null;
  restourant_session?: string | null;
}
