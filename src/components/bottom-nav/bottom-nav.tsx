import "./bottom-nav.scss";
import { HomeIcon } from "../icons/home-icon";
import { CartIcon } from "../icons/cart-icon";
import { OrdersIcon } from "../icons/orders-icon";
import { ProfileIcon } from "../icons/profile-icon";
import { useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/i18n-context";
import { useCart } from "@/contexts/cart-context";

const tg = window.Telegram.WebApp;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { totalItems } = useCart();

  const tabs = [
    { id: "home", path: "/", label: t.home, icon: <HomeIcon /> },
    { id: "cart", path: "/cart", label: t.cart, icon: <CartIcon /> },
    { id: "orders", path: "/orders", label: t.orders, icon: <OrdersIcon /> },
    {
      id: "profile",
      path: "/profile",
      label: t.profile,
      icon: <ProfileIcon />,
    },
  ];

  const handleTabClick = (path: string) => {
    if (location.pathname !== path) {
      if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred("light");
      }
      navigate(path);
    }
  };

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.id}
            className={`bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""} ${tab.id === "cart" ? "tour-cart-tab" : ""}`}
            onClick={() => handleTabClick(tab.path)}
          >
            <div className="bottom-nav__icon">
              {tab.icon}
              {tab.id === "cart" && totalItems > 0 && (
                <span className="bottom-nav__badge">{totalItems}</span>
              )}
            </div>
            <span className="bottom-nav__label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
