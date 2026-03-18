import example from "@/assets/example-2.jpg";

export interface IAddon {
  id: string;
  name: {
    ru: string;
    uz: string;
  };
  price: number;
}

export interface IProduct {
  id: string;
  name: {
    ru: string;
    uz: string;
  };
  price: number;
  weight: string;
  time: string;
  image: string;
  ingredients: {
    ru: string;
    uz: string;
  };
  description: {
    ru: string;
    uz: string;
  };
  addons?: IAddon[];
}

export interface ICategory {
  id: string;
  title: {
    ru: string;
    uz: string;
  };
  icon: string;
  products: IProduct[];
}

const mockAddons: IAddon[] = [
  {
    id: "cheese",
    name: { ru: "Сыр", uz: "Pishloq" },
    price: 5000,
  },
  {
    id: "jalapeno",
    name: { ru: "Халапеньо", uz: "Halapeno" },
    price: 3000,
  },
  {
    id: "sauce",
    name: { ru: "Соус", uz: "Sous" },
    price: 4000,
  },
];

const mockData: ICategory[] = [
  {
    id: "first",
    title: {
      ru: "Сети",
      uz: "Setlar",
    },
    icon: "🍱",
    products: [
      {
        id: "p1",
        name: {
          ru: "Фреш Бургер с курицей",
          uz: "Tovuqli Fresh Burger",
        },
        price: 43000,
        weight: "251 г",
        time: "15 мин",
        image: example,
        ingredients: {
          ru: "Куриное филе, панировка, салат, томаты, соус",
          uz: "Tovuq filesi, panira, salat, pomidor, sous",
        },
        description: {
          ru: "Свежий бургер с сочной курицей и овощами",
          uz: "Mazali tovuq va sabzavotli yangi burger",
        },
        addons: mockAddons,
      },
      {
        id: "p2",
        name: {
          ru: "Комбо Сет Макси",
          uz: "Kombo Set Maksi",
        },
        price: 85000,
        weight: "650 г",
        time: "20 мин",
        image: example,
        ingredients: {
          ru: "2 бургера, картофель фри, 2 напитка",
          uz: "2 burger, kartoshka fri, 2 ichimlik",
        },
        description: {
          ru: "Лучший выбор для двоих",
          uz: "Ikki kishi uchun eng yaxshi tanlov",
        },
        addons: mockAddons,
      },
    ],
  },
  {
    id: "second",
    title: {
      ru: "Курочка",
      uz: "Tovuq",
    },
    icon: "🍗",
    products: [
      {
        id: "p3",
        name: {
          ru: "Крылышки Баффало",
          uz: "Buffalo qanotchalar",
        },
        price: 35000,
        weight: "200 г",
        time: "12 мин",
        image: example,
        ingredients: {
          ru: "Куриные крылышки, острый соус",
          uz: "Tovuq qanotchalari, achchiq sous",
        },
        description: {
          ru: "Острые и сочные крылышки",
          uz: "Achchiq va mazali qanotchalar",
        },
        addons: mockAddons,
      },
    ],
  },
  {
    id: "third",
    title: {
      ru: "Снеки",
      uz: "Sneklar",
    },
    icon: "🍟",
    products: [],
  },
];

export { mockData };
