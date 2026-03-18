import { useState } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { useTable } from "@/contexts/table-context";
import "./orders-page.scss";

type OrderStatus = "all" | "active" | "delivering" | "completed";

export function OrdersPage(): React.ReactElement {
  const { t } = useI18n();
  const { tableNumber } = useTable();
  const [activeTab, setActiveTab] = useState<OrderStatus>("all");

  // Mock data - in real app this would come from API
  const orders: unknown[] = [];

  const tabs: { id: OrderStatus; label: string }[] = [
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
        {orders.length === 0 ? (
          <div className="orders-page__empty">
            <div className="orders-page__empty-icon">
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
            {/* Orders will be displayed here */}
          </div>
        )}
      </div>
    </div>
  );
}
