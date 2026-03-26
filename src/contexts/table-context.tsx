import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAuth } from "./auth-context";
import { useI18n } from "./i18n-context";

interface TableContextType {
  tableNumber: string | null;
  setTableNumber: (id: string | null) => void;
  scanTable: () => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: ReactNode }) {
  const { authData, login } = useAuth();
  const { t, language } = useI18n();
  const [tableNumber, setTableNumber] = useState<string | null>(() => {
    // 1. Try URL first
    const params = new URLSearchParams(window.location.search);
    const urlTable = params.get("table");
    if (urlTable) {
      localStorage.setItem("tableNumber", urlTable);
      return urlTable;
    }
    // 2. Try localStorage
    return localStorage.getItem("tableNumber");
  });

  useEffect(() => {
    const extractedTable = authData?.table_id 
      || authData?.organization?.table_number 
      || authData?.session?.table_number_id 
      || authData?.session?.table_number;
      
    if (extractedTable) {
      const num = String(extractedTable);
      setTableNumber(num);
      localStorage.setItem("tableNumber", num);
    } else {
      setTableNumber(null);
      localStorage.removeItem("tableNumber");
    }
  }, [authData]);

  useEffect(() => {
    // Sync URL param if it changes (e.g. scanning another QR)
    const checkUrl = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlTable = params.get("table");
      const startParam = params.get("start");

      let extractedTable = urlTable;
      if (startParam?.startsWith("tb_")) {
        extractedTable = startParam.replace("tb_", "");
      }

      if (extractedTable && extractedTable !== tableNumber) {
        setTableNumber(extractedTable);
        localStorage.setItem("tableNumber", extractedTable);
        await login(extractedTable);
      }
    };

    checkUrl();
    window.addEventListener("popstate", checkUrl);
    return () => window.removeEventListener("popstate", checkUrl);
  }, [tableNumber, login]);

  const extractTableId = (text: string): string | null => {
    try {
      if (text.includes("start?tb_")) {
        return text.split("start?tb_")[1] || null;
      }
      if (text.includes("start=tb_")) {
        return text.split("start=tb_")[1] || null;
      }
      if (text.startsWith("tb_")) {
        return text.replace("tb_", "");
      }
      if (text.startsWith("http")) {
        const url = new URL(text);
        const start = url.searchParams.get("start") || url.searchParams.get("table");
        if (start?.startsWith("tb_")) return start.replace("tb_", "");
        if (url.searchParams.get("table")) return url.searchParams.get("table");
      }
      return null; // Not a valid table QR
    } catch (e) {
      return null;
    }
  };

  const scanTable = () => {
    const tg = window.Telegram.WebApp;
    if (tg.showScanQrPopup) {
      tg.showScanQrPopup({ text: t.scannerTitle }, (text) => {
        const tableId = extractTableId(text);
        if (tableId) {
            setTableNumber(tableId);
            localStorage.setItem("tableNumber", tableId);
            login(tableId).catch((err) => {
               alert(err.message || (language === "uz" ? "Xatolik yuz berdi" : "Произошла ошибка"));
            });
            tg.closeScanQrPopup();
            return true;
        } else {
            alert(language === "uz" ? "Noto'g'ri QR kod" : "Неверный QR-код");
            return false;
        }
      });
    } else {
        // Fallback for browser testing
        const manual = prompt(t.scannerTitle);
        if (manual) {
           const tableId = extractTableId(manual);
           if (tableId) {
             setTableNumber(tableId);
             localStorage.setItem("tableNumber", tableId);
             login(tableId).catch((err) => {
               alert(err.message || (language === "uz" ? "Xatolik yuz berdi" : "Произошла ошибка"));
             });
           } else {
             alert(language === "uz" ? "Noto'g'ri QR kod" : "Неверный QR-код");
           }
        }
    }
  };

  return (
    <TableContext.Provider value={{ tableNumber, setTableNumber, scanTable }}>
      {children}
    </TableContext.Provider>
  );
}

export function useTable() {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error("useTable must be used within a TableProvider");
  }
  return context;
}
