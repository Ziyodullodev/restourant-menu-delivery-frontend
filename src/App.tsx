import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "./contexts/i18n-context";
import { CartProvider } from "./contexts/cart-context";
import { TableProvider } from "./contexts/table-context";
import { BottomNav } from "./components/bottom-nav/bottom-nav";
import { HomePage } from "./pages/home/home-page";
import { CartPage } from "./pages/cart/cart-page";
import { OrdersPage } from "./pages/orders/orders-page";
import { ProfilePage } from "./pages/profile/profile-page";
import { BankCardsPage } from "./pages/bank-cards/bank-cards-page";

import "swiper/css";
import "swiper/css/pagination";

const tg = window.Telegram.WebApp;

export function App(): React.ReactElement {
  useEffect(() => {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();

    // Set dynamic colors from "backend" (simulated)
    document.documentElement.style.setProperty('--accent-color', '#3ab64e');
    document.documentElement.style.setProperty('--price-color', '#3ab64e');
  }, []);

  return (
    <I18nProvider>
      <TableProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="app-container">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/bank-cards" element={<BankCardsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <BottomNav />
            </div>
          </BrowserRouter>
        </CartProvider>
      </TableProvider>
    </I18nProvider>
  );
}
