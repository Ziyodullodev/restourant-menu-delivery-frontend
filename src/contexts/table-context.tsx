import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface TableContextType {
    tableNumber: string | null;
    setTableNumber: (id: string | null) => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: ReactNode }) {
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
        // Sync URL param if it changes (e.g. scanning another QR)
        const checkUrl = () => {
            const params = new URLSearchParams(window.location.search);
            const urlTable = params.get("table");
            if (urlTable && urlTable !== tableNumber) {
                setTableNumber(urlTable);
                localStorage.setItem("tableNumber", urlTable);
            }
        };

        checkUrl();
        window.addEventListener("popstate", checkUrl);
        return () => window.removeEventListener("popstate", checkUrl);
    }, [tableNumber]);

    return (
        <TableContext.Provider value={{ tableNumber, setTableNumber }}>
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
