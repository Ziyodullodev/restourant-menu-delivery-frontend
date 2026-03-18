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
