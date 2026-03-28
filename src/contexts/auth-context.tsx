import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { deleteAllCartItems } from "@/services/api.service";

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
  button_colour?: string; // Add optional proper spelling
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
  telegram_account?: string;
  table_number?: string | number;
}


interface AuthData {
  access: string;
  refresh: string;
  session_id: string;
  organization: Organization;
  user: User;
  session?: any; // Add session property explicitly to AuthData
  table_id?: string;
}

interface AuthContextType {
  authData: AuthData | null;
  isLoading: boolean;
  error: string | null;
  login: (tableId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BASE_URL = "https://backend-v1.menio.uz/api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authData, setAuthData] = useState<AuthData | null>(() => {
    const cached = localStorage.getItem("auth_data");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Apply colors immediately if cached
        if (parsed.organization) {
          const org = parsed.organization;
          document.documentElement.style.setProperty("--accent-color", org.header_colour || "#F54927");
          document.documentElement.style.setProperty("--price-color", org.price_colour || "#F54927");
          document.documentElement.style.setProperty("--button-color", org.button_colour || org.button_clour || "#F54927");
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(!authData);
  const [error, setError] = useState<string | null>(null);

  const login = async (tableId?: string) => {
    setIsLoading(true);
    try {
      const tg = window.Telegram?.WebApp;
      const user = tg?.initDataUnsafe?.user;
      const telegramId = user?.id || 848796050;

      if (!telegramId) {
        throw new Error("Telegram user ID not found");
      }

      const body: any = {
        telegram_chat_id: telegramId,
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        username: user?.username || String(telegramId),
        language: user?.language_code || "uz"
      };

      if (tableId) {
        body.table_number_id = tableId;
      }

      const endpoint = tableId 
        ? `${BASE_URL}/r-client/auth/get-token/` 
        : `${BASE_URL}/r-client/auth/get-token/web/`;

      const response = await fetch(
        endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || errData.message || "Failed to authenticate");
      }

      const data: any = await response.json();

      // Robust organization extraction
      const foundOrg = data.organization || data.session?.restourant || data.session?.organization;
      const foundOrgId = foundOrg?.id || foundOrg?.organization_id || (typeof foundOrg === "string" ? foundOrg : null);
      
      const currentOrgId = authData?.organization?.id || authData?.organization?.organization;
      const isDifferentOrg = 
         currentOrgId && 
         foundOrgId && 
         String(currentOrgId) !== String(foundOrgId);

      // Table ID resolution strategy: prioritize explicit parameter, then response fields, then session fields
      const extractedTableNumber = tableId 
        || data.table_id 
        || data.table_number 
        || data.session?.table_number_id 
        || data.session?.table_number;

      let finalData: AuthData;

      if (isDifferentOrg) {
         // Agar tashkilot o'zgargan bo'lsa, eskisini qoldirmasdan to'liq almashtiramiz
         const newOrg = { ...(typeof foundOrg === "object" ? foundOrg : { id: foundOrgId }) };
         if (extractedTableNumber) newOrg.table_number = extractedTableNumber;

         finalData = {
            ...data,
            organization: newOrg,
            table_id: extractedTableNumber
         } as AuthData;
         
         // Mahalliy savatchani tozalaymiz
         localStorage.removeItem("delivery_cart");
         
         // Custom event yuboramiz, toki cart-context eshitib tozalab yuborsin
         window.dispatchEvent(new Event("organization_changed"));
      } else {
         // Refreshed same org OR fallback - merge defensively with cache
         const mergedOrg = {
            ...(authData?.organization || {}),
            ...(typeof foundOrg === "object" ? foundOrg : {}),
         } as Organization;

         // Sync organization id if it was just a string
         if (!mergedOrg.id && foundOrgId) mergedOrg.id = String(foundOrgId);

         // Sync table info from resolved strategy
         if (extractedTableNumber) mergedOrg.table_number = extractedTableNumber;

         finalData = {
           ...(authData || {}), 
           ...data,
           organization: mergedOrg,
         } as AuthData;

         if (extractedTableNumber) finalData.table_id = extractedTableNumber;

         // 1. Agar `/web` orqali kelsa va `session: null` qaytsa, 
         // lokal tashkilotni saqlab qolamiz ammo stol raqamini o'chirib tashlaymiz
         if (!tableId && data.session === null) {
             finalData.table_id = undefined;
             finalData.organization.table_number = undefined;
         }
      }

      const cached = localStorage.getItem("auth_data");
      let hasStorageOrg = false;
      if (cached) {
         try {
             const parsed = JSON.parse(cached);
             if (parsed?.organization?.id) hasStorageOrg = true;
         } catch(e) {}
      }

      // 2. Agar session kelmasa va storageda ham restoranga oid malumotlar bolmasa, 
      // scanner ochilishi uchun auth_data ni tozalaymiz.
      if (!finalData.session && !hasStorageOrg) {
         setAuthData(null);
         localStorage.removeItem("auth_data");
         return;
      }

      if (!finalData.organization?.id) {
         setAuthData(null);
         localStorage.removeItem("auth_data");
         return;
      }

      setAuthData(finalData);
      localStorage.setItem("auth_data", JSON.stringify(finalData));
      
      if (isDifferentOrg) {
         try {
            await deleteAllCartItems(); // Tozalash backenddan ham
         } catch (e) {
            console.error("Failed to delete cart on org change", e);
         }
      }

      if (finalData.organization) {
        const org = finalData.organization;
        document.documentElement.style.setProperty("--accent-color", org.header_colour || "#F54927");
        document.documentElement.style.setProperty("--price-color", org.price_colour || "#F54927");
        document.documentElement.style.setProperty("--button-color", org.button_colour || org.button_clour || "#F54927");
      }
    } catch (err: any) {
      setError(err.message || String(err));
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Small delay to ensure initial render from cache is stable
    const timer = setTimeout(() => {
        login(); // Do not pass authData?.table_id to avoid calling get-token/ on refresh
    }, 100);

    const handleAuthUpdated = () => {
      const cached = localStorage.getItem("auth_data");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setAuthData(parsed);
          if (parsed.organization) {
            const org = parsed.organization;
            document.documentElement.style.setProperty("--accent-color", org.header_colour || "#F54927");
            document.documentElement.style.setProperty("--price-color", org.price_colour || "#F54927");
            document.documentElement.style.setProperty("--button-color", org.button_colour || org.button_clour || "#F54927");
          }
        } catch (e) {}
      }
    };
    window.addEventListener("auth_data_updated", handleAuthUpdated);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("auth_data_updated", handleAuthUpdated);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ authData, isLoading, error, login }}>
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
