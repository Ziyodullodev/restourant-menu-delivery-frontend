import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SWIPE_THRESHOLD = 60; // px — minimal gorizontal masofa
const EDGE_ZONE = 40;       // px — chap chetdan boshlanishi kerak

/**
 * Ekranning chap chetidan o'ngga swipe qilinganda orqaga qaytaruvchi hook.
 * Profil sub-sahifalarida ishlatiladi.
 */
export function useSwipeBack() {
  const navigate = useNavigate();
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isEdgeSwipe = useRef<boolean>(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      touchStartX.current = x;
      touchStartY.current = y;
      // Faqat chap chekkadan boshlanganini tekshiramiz
      isEdgeSwipe.current = x <= EDGE_ZONE;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isEdgeSwipe.current) return;

      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);

      // O'ngga swipe va gorizontal yo'nalish ustunligi
      if (deltaX >= SWIPE_THRESHOLD && deltaY < deltaX) {
        navigate(-1);
      }
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [navigate]);
}
