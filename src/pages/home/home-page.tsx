import { useState, useRef, useCallback } from "react";
import { Header } from "@/components/header/header";
import { ScrollActiveWrapper } from "@/components/scroll-active-wrapper/scroll-active-wrapper";
import Swiper from "swiper";
import { useMenu } from "@/contexts/menu-context";

const SWIPE_THRESHOLD = 50; // px
const sectionOffset = 112 - 11;

export function HomePage(): React.ReactElement {
  const [swiperInstance, setSwiperInstance] = useState<Swiper | null>(null);
  const [userScroll, setUserScroll] = useState<boolean>(true);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const { categories } = useMenu();

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const navigateToCategory = useCallback(
    (index: number) => {
      if (index < 0 || index >= categories.length) return;

      setActiveIndex(index);
      setUserScroll(false);
      swiperInstance?.slideTo(index);

      const sections = document
        .getElementById("sections-container")
        ?.querySelectorAll<HTMLElement>("div.section");

      if (sections && sections[index]) {
        window.scrollTo({
          top: sections[index].offsetTop - sectionOffset,
          behavior: "smooth",
        });
      }
    },
    [categories.length, swiperInstance, setUserScroll]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const deltaX = touchStartX.current - e.changedTouches[0].clientX;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;

      // Faqat gorizontal swipe bo'lsa ishlaydi (vertikal scroll bilan aralashmaydi)
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;

      if (deltaX > 0) {
        // Chapga swipe → keyingi kategoriya
        navigateToCategory(activeIndex + 1);
      } else {
        // O'ngga swipe → oldingi kategoriya
        navigateToCategory(activeIndex - 1);
      }
    },
    [activeIndex, navigateToCategory]
  );

  return (
    <>
      <Header
        setUserScroll={setUserScroll}
        setSwiperInstance={setSwiperInstance}
        setActiveIndex={setActiveIndex}
        activeIndex={activeIndex}
      />
      <main
        className="main-content"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <ScrollActiveWrapper
          userScroll={userScroll}
          setUserScroll={setUserScroll}
          swiperInstance={swiperInstance}
          setActiveIndex={setActiveIndex}
        />
      </main>
    </>
  );
}
