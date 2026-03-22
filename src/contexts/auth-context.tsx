import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface User {
  id: number;
  full_name: string;
  username: string;
  language: string;
}

interface Organization {
  id: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  header_colour: string;
  button_clour: string;
  price_colour: string;
  logo: string | null;
  logo_svg: string | null;
  is_active: boolean;
  longitude: string;
  latitude: string;
  adress_name: string;
  has_delivery: boolean;
  created_at: string;
  updated_at: string;
  created_by: unknown;
  updated_by: unknown;
  admin: number;
  organization: string;
  working_start_time?: string;
  working_end_time?: string;
  telegram_channel?: string;
  instagram?: string;
  whatsapp?: string;
  telegram_chat_id?: string;
  telegram_account?: string;
}

interface Session {
  session_id: string;
  table_id: string;
  table_number: number;
  opened_at: string;
  expired_at: string;
  organization: Organization;
}

interface AuthData {
  access: string;
  refresh: string;
  session: Session;
  user: User;
}

interface AuthContextType {
  authData: AuthData | null;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BASE_URL = "https://backend-v1.menio.uz/api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const login = async () => {
      try {
        const tg = window.Telegram?.WebApp;
        const telegramId = tg?.initDataUnsafe?.user?.id || 848796050; // Use sandbox ID if not in TG

        if (!telegramId) {
          setError("Telegram user ID not found");
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `${BASE_URL}/r-client/auth/get-token/web/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              telegram_chat_id: telegramId,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to authenticate");
        }

        const data: AuthData = await response.json();
        setAuthData(data);

        // Tokenni localStorage ga saqlaymiz — api.service ishlashi uchun
        localStorage.setItem("auth_data", JSON.stringify(data));

        // Organisatsiya ranglarini CSS o'zgaruvchilariga qo'yamiz
        if (data.session?.organization) {
          const org = data.session.organization;
          document.documentElement.style.setProperty(
            "--accent-color",
            org.header_colour || "#F54927",
          );
          document.documentElement.style.setProperty(
            "--price-color",
            org.price_colour || "#F54927",
          );
          document.documentElement.style.setProperty(
            "--button-color",
            org.button_clour || "#F54927",
          );
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
        console.error("Auth error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    login();
  }, []);

  return (
    <AuthContext.Provider value={{ authData, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
