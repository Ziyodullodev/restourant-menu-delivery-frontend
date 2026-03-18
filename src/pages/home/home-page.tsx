import { useState } from "react";
import { Header } from "@/components/header/header";
import { ScrollActiveWrapper } from "@/components/scroll-active-wrapper/scroll-active-wrapper";
import Swiper from "swiper";

export function HomePage(): React.ReactElement {
  const [swiperInstance, setSwiperInstance] = useState<Swiper | null>(null);
  const [userScroll, setUserScroll] = useState<boolean>(true);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  return (
    <>
      <Header
        setUserScroll={setUserScroll}
        setSwiperInstance={setSwiperInstance}
        setActiveIndex={setActiveIndex}
        activeIndex={activeIndex}
      />
      <main className="main-content">
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
