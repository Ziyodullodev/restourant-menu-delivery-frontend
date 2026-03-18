import "./bottom-nav.scss";
import { HomeIcon } from "../icons/home-icon";
import { CartIcon } from "../icons/cart-icon";
import { OrdersIcon } from "../icons/orders-icon";
import { ProfileIcon } from "../icons/profile-icon";
import { useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/i18n-context";
import { useCart } from "@/contexts/cart-context";

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

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`bottom-nav__item ${location.pathname === tab.path ? "bottom-nav__item--active" : ""}`}
          onClick={() => navigate(tab.path)}
        >
          <div className="bottom-nav__icon">
            {tab.icon}
            {tab.id === "cart" && totalItems > 0 && (
              <span className="bottom-nav__badge">{totalItems}</span>
            )}
          </div>
          <span className="bottom-nav__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
