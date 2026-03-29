import { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "./contexts/i18n-context";
import { CartProvider } from "./contexts/cart-context";
import { TableProvider, useTable } from "./contexts/table-context";
import { OrderTypeProvider } from "./contexts/order-type-context";
import { BottomNav } from "./components/bottom-nav/bottom-nav";
import { useAuth } from "./contexts/auth-context";
import { HomePage } from "./pages/home/home-page";
import { CartPage } from "./pages/cart/cart-page";
import { OrdersPage } from "./pages/orders/orders-page";
import { ProfilePage } from "./pages/profile/profile-page";
import { BankCardsPage } from "./pages/bank-cards/bank-cards-page";
import { AboutPage } from "./pages/about/about-page";
import { AuthProvider } from "./contexts/auth-context";
import { MenuProvider } from "./contexts/menu-context";
import { BranchesPage } from "./pages/branches/branches-page";
import { PrivacyPage } from "./pages/privacy/privacy-page";
import { FeedbackPage } from "./pages/feedback/feedback-page";

import "swiper/css";
import "swiper/css/pagination";
import { OnboardingTour } from "./components/tour/onboarding-tour";

const tg = window.Telegram.WebApp;

function OrganizationGuard({ children }: { children: React.ReactNode }) {
  const { authData, isLoading } = useAuth();
  const { scanTable } = useTable();

  useEffect(() => {
     if (!isLoading && authData && !authData.organization) {
         scanTable();
     }
  }, [authData, isLoading, scanTable]);

  if (isLoading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Yuklanmoqda...</div>;
  }

  if (!authData?.organization) {
    const isDark = tg.colorScheme === "dark";
    return (
       <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: isDark ? "#121212" : "#ffffff" }}>
          <button 
             onClick={scanTable}
             style={{ 
               background: "#F54927", 
               color: "#ffffff", 
               border: "none", 
               padding: "16px 32px", 
               borderRadius: 12, 
               fontSize: 16, 
               fontWeight: 600,
               boxShadow: "0 4px 12px rgba(245, 73, 39, 0.3)"
             }}
          >
             Stol raqamini skaner qilish
          </button>
       </div>
    );
  }

  return <>{children}</>;
}

export function App(): React.ReactElement {
  useEffect(() => {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
    if (typeof tg.disableVerticalSwipes === "function") {
      tg.disableVerticalSwipes(); // 👈 mana shu kerak
    } else {
      console.warn("disableVerticalSwipes mavjud emas");
    }
  }, []);

  return (
    <AuthProvider>
      <I18nProvider>
        <TableProvider>
          <OrganizationGuard>
            <OrderTypeProvider>
              <MenuProvider>
                <CartProvider>
                  <HashRouter>
                    <div className="app-container">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/bank-cards" element={<BankCardsPage />} />
                        <Route path="/branches" element={<BranchesPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/feedback" element={<FeedbackPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                      <BottomNav />
                      <OnboardingTour />
                    </div>
                  </HashRouter>
                </CartProvider>
              </MenuProvider>
            </OrderTypeProvider>
          </OrganizationGuard>
        </TableProvider>
      </I18nProvider>
    </AuthProvider>
  );
}
