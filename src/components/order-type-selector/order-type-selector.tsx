import { useOrderType, OrderType } from "@/contexts/order-type-context";
import { useTable } from "@/contexts/table-context";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { DeliveryIcon } from "../icons/delivery-icon";
import { PickupIcon } from "../icons/pickup-icon";
import { InRestaurantIcon } from "../icons/in-restaurant-icon";
import { ChevronDown } from "../icons/chevron-down";
import { useState, useRef, useEffect } from "react";
import "./order-type-selector.scss";

interface IProps {
  align?: "left" | "right";
}

export function OrderTypeSelector({ align = "left" }: IProps) {
  const { 
    orderType, 
    setOrderType,
    selectedBranch,
    setSelectedBranch,
    branches
  } = useOrderType();
  const { tableNumber, scanTable } = useTable();
  const { t, language } = useI18n();
  const { authData } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSelectingBranch, setIsSelectingBranch] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsSelectingBranch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getActiveLabel = () => {
    switch (orderType) {
      case "delivery": return t.delivery;
      case "pickup": 
        if (selectedBranch) {
           return language === "uz" ? selectedBranch.name_uz : selectedBranch.name_ru || selectedBranch.name_uz;
        }
        return t.pickup;
      case "in_restaurant": return `${t.table} #${tableNumber || "1"}`;
      default: return "";
    }
  };

  const getActiveIcon = () => {
    switch (orderType) {
       case "delivery": return <DeliveryIcon />;
       case "pickup": return <PickupIcon />;
       case "in_restaurant": return <InRestaurantIcon />;
    }
  };

  return (
    <div className={`order-type-selector order-type-selector--align-${align}`} ref={dropdownRef}>
      <button 
        className="order-type-selector__btn tour-order-type" 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        data-active={isDropdownOpen}
      >
        {getActiveIcon()}
        <span className="order-type-selector__label">{getActiveLabel()}</span>
        <ChevronDown className="order-type-selector__chevron" />
      </button>

      {isDropdownOpen && (
        <div className="order-type-selector__dropdown">
          {!isSelectingBranch ? (
            <>
              {(["delivery", "pickup", "in_restaurant"] as OrderType[])
                .filter(type => {
                   if (type !== 'delivery') return true;
                   // If pickup branch selected, check its has_delivery
                   if (selectedBranch) return selectedBranch.has_delivery;
                   // Fallback to session organization has_delivery
                   return authData?.organization?.has_delivery ?? true;
                })
                .map((type) => (
                <button
                  key={type}
                  className="order-type-selector__dropdown-item"
                  data-selected={orderType === type}
                  onClick={() => {
                    if (type === "pickup" && branches.length > 1) {
                        setIsSelectingBranch(true);
                        return;
                    }
                    if (type === "in_restaurant" && !tableNumber) {
                        setIsDropdownOpen(false);
                        scanTable();
                        return;
                    }
                    setOrderType(type);
                    setIsDropdownOpen(false);
                  }}
                >
                  {type === "delivery" && <DeliveryIcon />}
                  {type === "pickup" && <PickupIcon />}
                  {type === "in_restaurant" && <InRestaurantIcon />}
                  <span>
                    {type === "delivery" && t.delivery}
                    {type === "pickup" && t.pickup}
                    {type === "in_restaurant" && t.inRestaurant}
                  </span>
                  {type === "in_restaurant" && (
                    <span className="order-type-selector__dropdown-badge">#{tableNumber || "1"}</span>
                  )}
                </button>
              ))}
            </>
          ) : (
            <>
               <button 
                  className="order-type-selector__dropdown-back"
                  onClick={() => setIsSelectingBranch(false)}
               >
                 {language === "uz" ? "⬅️ Orqaga" : "⬅️ Назад"}
               </button>
               <p className="order-type-selector__dropdown-title">{t.selectBranch}</p>
               {branches.map((br) => (
                  <button
                    key={br.id}
                    className="order-type-selector__dropdown-item"
                    data-selected={selectedBranch?.id === br.id}
                    onClick={() => {
                      setSelectedBranch(br);
                      setOrderType("pickup");
                      setIsDropdownOpen(false);
                      setIsSelectingBranch(false);
                    }}
                  >
                    <span>{language === "uz" ? br.name_uz : br.name_ru || br.name_uz}</span>
                  </button>
               ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
