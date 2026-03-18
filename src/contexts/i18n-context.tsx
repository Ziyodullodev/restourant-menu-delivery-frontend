import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAuth } from "./auth-context";

export type Language = "uz" | "ru";

interface Translations {
  // Navigation
  home: string;
  cart: string;
  orders: string;
  profile: string;

  // Header
  table: string;
  tableNumber: string;
  delivery: string;
  pickup: string;

  // Cart
  cartTitle: string;
  clearCart: string;
  total: string;
  placeOrder: string;
  emptyCart: string;
  emptyCartMessage: string;
  addToCart: string;

  // Orders
  ordersTitle: string;
  all: string;
  active: string;
  delivering: string;
  completed: string;
  noOrders: string;
  noOrdersMessage: string;

  // Profile
  profileTitle: string;
  myAddresses: string;
  bankCards: string;
  aboutUs: string;
  privacyPolicy: string;
  support: string;
  contactUs: string;
  edit: string;

  // Common
  sum: string;
}

const translations: Record<Language, Translations> = {
  uz: {
    // Navigation
    home: "Bosh sahifa",
    cart: "Savat",
    orders: "Buyurtmalar",
    profile: "Profil",

    // Header
    table: "Stol",
    tableNumber: "Stol raqami",
    delivery: "Yetkazib berish",
    pickup: "Olib ketish",

    // Cart
    cartTitle: "Savat",
    clearCart: "Tozalash",
    total: "Jami:",
    placeOrder: "Buyurtma berish",
    emptyCart: "Savat bo'sh",
    emptyCartMessage: "Mahsulotlar qo'shing",
    addToCart: "Savatga",

    // Orders
    ordersTitle: "Mening buyurtmalarim",
    all: "Hammasi",
    active: "Faol",
    delivering: "Yetkazilmoqda",
    completed: "Bajarilgan",
    noOrders: "Buyurtmalar yo'q",
    noOrdersMessage: "Buyurtmalaringiz shu yerda ko'rinadi",

    // Profile
    profileTitle: "Profil",
    myAddresses: "Mening manzillarim",
    bankCards: "Bank kartalari",
    aboutUs: "Biz haqimizda",
    privacyPolicy: "Maxfiylik siyosati",
    support: "YORDAM",
    contactUs: "Biz bilan bog'lanish",
    edit: "Tahrirlash",

    // Common
    sum: "so'm",
  },
  ru: {
    // Navigation
    home: "Главная",
    cart: "Корзина",
    orders: "Заказы",
    profile: "Профиль",

    // Header
    table: "Стол",
    tableNumber: "Номер стола",
    delivery: "Доставка",
    pickup: "Самовывоз",

    // Cart
    cartTitle: "Корзина",
    clearCart: "Очистить",
    total: "Итого:",
    placeOrder: "Заказать",
    emptyCart: "Корзина пуста",
    emptyCartMessage: "Добавьте товары",
    addToCart: "В корзину",

    // Orders
    ordersTitle: "Мои заказы",
    all: "Все",
    active: "Активные",
    delivering: "Доставляются",
    completed: "Завершенные",
    noOrders: "Нет заказов",
    noOrdersMessage: "Ваши заказы появятся здесь",

    // Profile
    profileTitle: "Профиль",
    myAddresses: "Мои адреса",
    bankCards: "Банковские карты",
    aboutUs: "О нас",
    privacyPolicy: "Политика конфиденциальности",
    support: "ПОДДЕРЖКА",
    contactUs: "Связаться с нами",
    edit: "Редактировать",

    // Common
    sum: "сум",
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { authData } = useAuth();
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("language") as Language) || "ru";
  });

  useEffect(() => {
    if (authData?.user?.language) {
      const userLang = authData.user.language as Language;
      if (userLang === "uz" || userLang === "ru") {
        setLanguage(userLang);
        localStorage.setItem("language", userLang);
      }
    }
  }, [authData]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const value: I18nContextType = {
    language,
    setLanguage: handleSetLanguage,
    t: translations[language],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
