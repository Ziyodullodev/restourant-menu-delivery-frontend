import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { useTable } from "@/contexts/table-context";
import { fetchOrderHistory } from "@/services/api.service";
import { IApiOrder, IApiOrderItem } from "@/types/api.types";
import { numberDigits } from "@/helpers/number-digits";
import "./orders-page.scss";

import { useAuth } from "@/contexts/auth-context";

type TabStatus = "all" | "active" | "delivering" | "completed";

export function OrdersPage(): React.ReactElement {
  const { t, language } = useI18n();
  const { tableNumber } = useTable();
  const { authData } = useAuth();
  const [activeTab, setActiveTab] = useState<TabStatus>("all");
  const [orders, setOrders] = useState<IApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const branch = authData?.session?.organization?.id;
    if (!branch && authData === null) return; // Wait for auth if needed, but if authData is loaded and no branch, we can proceed or fail

    setIsLoading(true);
    fetchOrderHistory({ branch })
      .then((data) => setOrders(data.results))
      .catch((err) => console.error("Orders fetch error:", err))
      .finally(() => setIsLoading(false));
  }, [authData]);

  const getFilteredOrders = () => {
    if (activeTab === "all") return orders;
    if (activeTab === "active") {
      return orders.filter((o: IApiOrder) => ["new", "restourant_accepted", "cooking", "coked"].includes(o.status));
    }
    if (activeTab === "delivering") {
      return orders.filter((o: IApiOrder) => o.status === "delivering");
    }
    if (activeTab === "completed") {
      return orders.filter((o: IApiOrder) => o.status === "completed" || o.status === "delivered");
    }
    return orders;
  };

  const filteredOrders = getFilteredOrders();

  const tabs: { id: TabStatus; label: string }[] = [
    { id: "all", label: t.all },
    { id: "active", label: t.active },
    { id: "delivering", label: t.delivering },
    { id: "completed", label: t.completed },
  ];

  return (
    <div className="orders-page">
      <div className="orders-page__header">
        <div className="orders-page__header-left">
          <h1 className="orders-page__title">{t.ordersTitle}</h1>
          {tableNumber && (
            <div className="orders-page__table">
              <span className="orders-page__table-label">{t.table}</span>
              <span className="orders-page__table-number">#{tableNumber}</span>
            </div>
          )}
        </div>
      </div>

      <div className="orders-page__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`orders-page__tab ${activeTab === tab.id ? "orders-page__tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} {tab.id === "all" && `(${orders.length})`}
          </button>
        ))}
      </div>

      <div className="orders-page__content">
        {isLoading ? (
          <div className="orders-page__loading">...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-page__empty">
            <div className="orders-page__empty-icon">
              {/* SVG icon remains same */}
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="20"
                  y="30"
                  width="80"
                  height="70"
                  rx="8"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  d="M35 30V25C35 20 40 15 50 15H70C80 15 85 20 85 25V30"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle
                  cx="60"
                  cy="65"
                  r="15"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  d="M60 58V72M53 65H67"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="orders-page__empty-title">{t.noOrders}</h2>
            <p className="orders-page__empty-message">{t.noOrdersMessage}</p>
          </div>
        ) : (
          <div className="orders-page__list">
            {filteredOrders.map((order: IApiOrder) => {
              const displayId = String(order.id).length > 8 ? String(order.id).slice(0, 8).toUpperCase() : order.id;
              
              return (
              <div key={order.id} className="order-card">
                <div className="order-card__header">
                  <div className="order-card__header-left">
                    <span className="order-card__label">{t.ordersTitle?.split(" ")[0] || "Buyurtma"}</span>
                    <span className="order-card__number">#{displayId}</span>
                  </div>
                  <span className={`order-card__status order-card__status--${order.status}`}>
                    {order.status_display || order.status}
                  </span>
                </div>

                <div className="order-card__content">
                  <div className="order-card__items">
                    {order.items.map((item: IApiOrderItem) => {
                      const pName = language === "uz" ? item.product.name_uz : (item.product.name_ru || item.product.name_uz);
                      return (
                        <div key={item.id} className="order-card__item">
                          <div className="order-card__item-left">
                            {item.product.small_image ? (
                              <img src={item.product.small_image} alt={pName} className="order-card__item-img" />
                            ) : (
                              <div className="order-card__item-placeholder">🍽️</div>
                            )}
                            <div className="order-card__item-info">
                              <span className="order-card__item-name">{pName}</span>
                              <span className="order-card__item-price">{numberDigits(item.product.current_price)} {t.sum}</span>
                            </div>
                          </div>
                          <div className="order-card__item-qty">
                            x{item.amount}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="order-card__footer">
                  <div className="order-card__date">
                    {new Date(order.created_at).toLocaleString(language === "uz" ? "uz-UZ" : "ru-RU", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                    })}
                  </div>
                  <div className="order-card__total">
                    <span className="order-card__total-label">{t.total}</span>
                    <span className="order-card__total-price">{numberDigits(order.current_price)} {t.sum}</span>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
