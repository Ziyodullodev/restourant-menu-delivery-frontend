import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useTable } from "./table-context";
import { IApiBranch } from "@/types/api.types";
import { fetchBranches } from "@/services/api.service";
import { useAuth } from "./auth-context";

export type OrderType = "delivery" | "pickup" | "in_restaurant";

interface OrderTypeContextType {
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  selectedBranch: IApiBranch | null;
  setSelectedBranch: (branch: IApiBranch | null) => void;
  branches: IApiBranch[];
  isOnlyMenu: boolean;
  availableTypes: OrderType[];
}

const OrderTypeContext = createContext<OrderTypeContextType | undefined>(undefined);

export function OrderTypeProvider({ children }: { children: ReactNode }) {
  const { tableNumber, scanTable } = useTable();
  const { authData } = useAuth();
  const [orderType, setOrderType] = useState<OrderType>(() => {
    return (localStorage.getItem("orderType") as OrderType) || "pickup";
  });
  const [branches, setBranches] = useState<IApiBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<IApiBranch | null>(() => {
    const saved = localStorage.getItem("selectedBranch");
    if (saved) return JSON.parse(saved);
    return null;
  });

  useEffect(() => {
    if (authData) {
      fetchBranches()
        .then((res) => {
          setBranches(res);
          // Auto select if only one branch or none selected
          if (res.length === 1) {
            setSelectedBranch(res[0]);
            localStorage.setItem("selectedBranch", JSON.stringify(res[0]));
          }
        })
        .catch(console.error);
    }
  }, [authData]);

  const org = authData?.organization;
  const availableTypes: OrderType[] = [
    ...(org?.has_delivery ? ["delivery" as OrderType] : []),
    ...(org?.has_pickup ? ["pickup" as OrderType] : []),
    ...(org?.has_restourant ? ["in_restaurant" as OrderType] : []),
  ];
  const isOnlyMenu = availableTypes.length === 0;

  // Auto-correct orderType if current one is not available
  useEffect(() => {
    if (isOnlyMenu) return;
    if (!availableTypes.includes(orderType)) {
      handleSetOrderType(availableTypes[0]);
    }
  }, [authData]);

  useEffect(() => {
    if (tableNumber && orderType === "pickup") {
      handleSetOrderType("in_restaurant");
    } else if (!tableNumber && orderType === "in_restaurant") {
      handleSetOrderType("pickup");
    }
  }, [tableNumber]);

  const handleSetSelectedBranch = (branch: IApiBranch | null) => {
    setSelectedBranch(branch);
    if (branch) {
      localStorage.setItem("selectedBranch", JSON.stringify(branch));
    } else {
      localStorage.removeItem("selectedBranch");
    }
  };

  const handleSetOrderType = (type: OrderType) => {
    setOrderType(type);
    localStorage.setItem("orderType", type);
    if (type === "in_restaurant" && !tableNumber) {
        scanTable();
    }
  };

  return (
    <OrderTypeContext.Provider value={{
      orderType,
      setOrderType: handleSetOrderType,
      selectedBranch,
      setSelectedBranch: handleSetSelectedBranch,
      branches,
      isOnlyMenu,
      availableTypes,
    }}>
      {children}
    </OrderTypeContext.Provider>
  );
}

export function useOrderType() {
  const context = useContext(OrderTypeContext);
  if (context === undefined) {
    throw new Error("useOrderType must be used within an OrderTypeProvider");
  }
  return context;
}
