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
  inRestaurant: string;

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
  pullToRefresh: string;
  releaseToRefresh: string;

  // Profile
  profileTitle: string;
  myAddresses: string;
  bankCards: string;
  aboutUs: string;
  privacyPolicy: string;
  support: string;
  contactUs: string;
  edit: string;
  changeTable: string;
  scannerTitle: string;
  orderStatus: string;
  selectBranch: string;
  enterPhone: string;
  selectLocation: string;
  confirmLocation: string;
  phonePlaceholder: string;
  addressPlaceholder: string;
  next: string;
  back: string;

  // Common
  sum: string;
  cancelOrder: string;
  cancelReasonTitle: string;
  cancelReasonPlaceholder: string;
  confirmCancel: string;
  cancel: string;
  cancelNotAllowed: string;
  loading: string;
  unknownProduct: string;
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
    inRestaurant: "Restoranda",

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
    pullToRefresh: "Yangilash uchun torting",
    releaseToRefresh: "Yangilash uchun qo'yib yuboring",

    // Profile
    profileTitle: "Profil",
    myAddresses: "Mening manzillarim",
    bankCards: "Bank kartalari",
    aboutUs: "Biz haqimizda",
    privacyPolicy: "Maxfiylik siyosati",
    support: "YORDAM",
    contactUs: "Biz bilan bog'lanish",
    edit: "Tahrirlash",
    changeTable: "Stolni o'zgartirish",
    scannerTitle: "QR kodni skanerlang",
    orderStatus: "Buyurtma berish usuli",
    selectBranch: "Filialni tanlang",
    enterPhone: "Telefon raqamingizni kiriting",
    selectLocation: "Yetkazib berish manzilingizni tanlang",
    confirmLocation: "Manzilni tasdiqlash",
    phonePlaceholder: "+998 90 123 45 67",
    addressPlaceholder: "Manzilni kiriting yoki xaritadan tanlang",
    next: "Keyingisi",
    back: "Orqaga",

    // Common
    sum: "so'm",
    cancelOrder: "Buyurtmani bekor qilish",
    cancelReasonTitle: "Bekor qilish sababi",
    cancelReasonPlaceholder: "Sababini kiriting...",
    confirmCancel: "Tasdiqlash",
    cancel: "Bekor qilish",
    cancelNotAllowed: "Bu buyurtmani bekor qilib bo'lmaydi",
    loading: "Yuklanmoqda...",
    unknownProduct: "Mahsulot topilmadi",
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
    inRestaurant: "В ресторане",

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
    pullToRefresh: "Потяните для обновления",
    releaseToRefresh: "Отпустите для обновления",

    // Profile
    profileTitle: "Профиль",
    myAddresses: "Мои адреса",
    bankCards: "Банковские карты",
    aboutUs: "О нас",
    privacyPolicy: "Политика конфиденциальности",
    support: "ПОДДЕРЖКА",
    contactUs: "Связаться с нами",
    edit: "Редактировать",
    changeTable: "Изменить стол",
    scannerTitle: "Отсканируйте QR-код",
    orderStatus: "Способ заказа",
    selectBranch: "Выберите филиал",
    enterPhone: "Введите ваш номер телефона",
    selectLocation: "Выберите адрес доставки",
    confirmLocation: "Подтвердить адрес",
    phonePlaceholder: "+998 90 123 45 67",
    addressPlaceholder: "Введите адрес или выберите на карте",
    next: "Далее",
    back: "Назад",

    // Common
    sum: "сум",
    cancelOrder: "Отменить заказ",
    cancelReasonTitle: "Причина отмены",
    cancelReasonPlaceholder: "Введите причину...",
    confirmCancel: "Подтвердить",
    cancel: "Отмена",
    cancelNotAllowed: "Этот заказ нельзя отменить",
    loading: "Загрузка...",
    unknownProduct: "Товар не найден",
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
