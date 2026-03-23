import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { fetchOrderHistory } from "@/services/api.service";
import { IApiOrder, IApiOrderItem } from "@/types/api.types";
import { numberDigits } from "@/helpers/number-digits";
import "./orders-page.scss";

import { useAuth } from "@/contexts/auth-context";

type TabStatus = "all" | "active" | "delivering" | "completed";

export function OrdersPage(): React.ReactElement {
  const { t, language } = useI18n();
  const { authData } = useAuth();
  const [activeTab, setActiveTab] = useState<TabStatus>("all");
  const [orders, setOrders] = useState<IApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Pull to refresh states
  const [pullDistance, setPullDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const PULL_THRESHOLD = 80;

  const observer = useRef<IntersectionObserver | null>(null);
  const lastOrderElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isFetchingMore || isRefreshing) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingMore, isRefreshing, hasMore]);

  const loadOrders = async (pageNum: number, isInitial = false, isRefresh = false) => {
    const branch = authData?.session?.organization?.id;
    if (!branch && authData === null) return;

    if (isInitial) setIsLoading(true);
    if (isRefresh) setIsRefreshing(true);
    if (!isInitial && !isRefresh) setIsFetchingMore(true);

    try {
      const data = await fetchOrderHistory({ branch, page: pageNum });
      if (isInitial || isRefresh) {
        setOrders(data.results);
      } else {
        setOrders(prev => [...prev, ...data.results]);
      }
      setHasMore(pageNum < data.pages);
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
      setIsRefreshing(false);
      setPullDistance(0);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadOrders(1, true);
  }, [authData]);

  useEffect(() => {
    if (page > 1) {
      loadOrders(page);
    }
  }, [page]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].pageY;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].pageY;
    const distance = currentY - startY.current;
    if (distance > 0) {
      setPullDistance(Math.min(distance * 0.5, PULL_THRESHOLD + 20));
      if (distance > 10) {
         if (e.cancelable) e.preventDefault();
      }
    } else {
      setIsDragging(false);
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (pullDistance >= PULL_THRESHOLD) {
      setPage(1);
      setHasMore(true);
      loadOrders(1, false, true);
    } else {
      setPullDistance(0);
    }
  };

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
    <div 
      className="orders-page"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="orders-page__pull-indicator"
        style={{ 
          height: `${pullDistance}px`,
          opacity: pullDistance / PULL_THRESHOLD,
          transform: `scale(${Math.min(pullDistance / PULL_THRESHOLD, 1)})`
        }}
      >
        <div className={`spinner spinner--small ${pullDistance >= PULL_THRESHOLD ? "spinner--active" : ""}`}></div>
        <span>{pullDistance >= PULL_THRESHOLD ? t.releaseToRefresh || "Yangilash uchun qo'yib yuboring" : t.pullToRefresh || "Yangilash uchun torting"}</span>
      </div>

      <div className="orders-page__header">
        <div className="orders-page__header-left">
          <h1 className="orders-page__title">{t.ordersTitle}</h1>
        </div>
      </div>

      <div className="orders-page__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`orders-page__tab ${activeTab === tab.id ? "orders-page__tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} {tab.id === "all" && orders.length > 0 && `(${orders.length})`}
          </button>
        ))}
      </div>

      <div className="orders-page__content">
        {(isLoading && page === 1) || isRefreshing ? (
          <div className="orders-page__loading">
             <div className="spinner"></div>
             <span>{isRefreshing ? "Yangilanmoqda..." : "Yuklanmoqda..."}</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-page__empty">
            <div className="orders-page__empty-icon">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="30" width="80" height="70" rx="8" stroke="currentColor" strokeWidth="4" fill="none" />
                <path d="M35 30V25C35 20 40 15 50 15H70C80 15 85 20 85 25V30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <circle cx="60" cy="65" r="15" stroke="currentColor" strokeWidth="4" fill="none" />
                <path d="M60 58V72M53 65H67" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="orders-page__empty-title">{t.noOrders}</h2>
            <p className="orders-page__empty-message">{t.noOrdersMessage}</p>
          </div>
        ) : (
          <div className="orders-page__list">
            {filteredOrders.map((order: IApiOrder, index) => {
              const displayId = String(order.id).length > 8 ? String(order.id).slice(0, 8).toUpperCase() : order.id;
              const isLastElement = filteredOrders.length === index + 1;
              
              return (
              <div 
                key={order.id} 
                className="order-card"
                ref={isLastElement ? lastOrderElementRef : null}
              >
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
            {isFetchingMore && (
              <div className="orders-page__fetching-more">
                 <div className="spinner spinner--small"></div>
                 <span>Yuklanmoqda...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
