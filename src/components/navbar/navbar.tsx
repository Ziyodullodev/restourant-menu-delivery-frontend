import Swiper from "swiper";
import { Swiper as NavSwiper, SwiperSlide } from "swiper/react";
import "./navbar.scss";
import { mockData } from "../mock/mock";
import { memo, useRef } from "react";
import { FreeMode } from "swiper/modules";
import { useI18n } from "@/contexts/i18n-context";

interface IProps {
  setSwiperInstance: React.Dispatch<React.SetStateAction<Swiper | null>>;
  setUserScroll: (value: boolean) => void;
  setActiveIndex: (value: number) => void;
  activeIndex: number;
}

function Copmonent(props: IProps): React.ReactElement {
  const { setSwiperInstance, setUserScroll, setActiveIndex, activeIndex } =
    props;
  const navbarRef = useRef<HTMLDivElement | null>(null);
  const { language } = useI18n();
  const sectionOffset = 112 - 11;

  const clickHandler = (activeIndex: number) => {
    setActiveIndex(activeIndex);
    setUserScroll(false);
    const sectionContainer =
      navbarRef?.current?.closest("header")?.nextElementSibling;

    if (!sectionContainer) return;

    const sections =
      sectionContainer.querySelectorAll<HTMLElement>("div.section");
    if (activeIndex >= 0 && activeIndex < sections.length) {
      const section = sections[activeIndex];
      window.scrollTo({
        top: section.offsetTop - sectionOffset,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="navbar" ref={navbarRef}>
      <NavSwiper
        slidesPerView="auto"
        pagination={{
          clickable: true,
        }}
        allowTouchMove
        modules={[FreeMode]}
        className="navbar__swiper"
        onSwiper={setSwiperInstance}
        centeredSlides
        slideToClickedSlide
        freeMode
      >
        {mockData?.map((category, index) => (
          <SwiperSlide key={category.id} className="navbar__item">
            <button
              onClick={() => clickHandler(index)}
              className="navbar__btn"
              data-active={activeIndex === index}
            >
              <span className="navbar__icon">{category.icon}</span>
              {category.title[language as "ru" | "uz"]}
            </button>
          </SwiperSlide>
        ))}
      </NavSwiper>
    </div>
  );
}

const Navbar = memo(Copmonent);

export { Navbar };
