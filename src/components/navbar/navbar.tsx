import Swiper from "swiper";
import { Swiper as NavSwiper, SwiperSlide } from "swiper/react";
import "./navbar.scss";
import { memo, useRef } from "react";
import { FreeMode } from "swiper/modules";
import { useI18n } from "@/contexts/i18n-context";
import { useMenu } from "@/contexts/menu-context";

interface IProps {
  setSwiperInstance: React.Dispatch<React.SetStateAction<Swiper | null>>;
  setUserScroll: (value: boolean) => void;
  setActiveIndex: (value: number) => void;
  activeIndex: number;
}

function Component(props: IProps): React.ReactElement {
  const { setSwiperInstance, setUserScroll, setActiveIndex, activeIndex } =
    props;
  const navbarRef = useRef<HTMLDivElement | null>(null);
  const { language } = useI18n();
  const { categories, isLoading } = useMenu();
  const sectionOffset = 112 - 11;

  const clickHandler = (index: number) => {
    setActiveIndex(index);
    setUserScroll(false);
    const sectionContainer =
      navbarRef?.current?.closest("header")?.nextElementSibling;

    if (!sectionContainer) return;

    const sections =
      sectionContainer.querySelectorAll<HTMLElement>("div.section");
    if (index >= 0 && index < sections.length) {
      const section = sections[index];
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
        pagination={{ clickable: true }}
        allowTouchMove
        modules={[FreeMode]}
        className="navbar__swiper"
        onSwiper={setSwiperInstance}
        centeredSlides
        slideToClickedSlide
        freeMode
      >
        {isLoading
          ? // Skeleton slides
            Array.from({ length: 4 }).map((_, i) => (
              <SwiperSlide key={i} className="navbar__item">
                <div className="navbar__skeleton" />
              </SwiperSlide>
            ))
          : categories?.map((category, index) => {
              const name =
                language === "uz" ? category.name_uz : category.name_ru;
              return (
                <SwiperSlide key={category.id} className="navbar__item">
                  <button
                    onClick={() => clickHandler(index)}
                    className="navbar__btn"
                    data-active={activeIndex === index}
                  >
                    {category.image && (
                      <span className="navbar__icon">
                        <img
                          src={category.image}
                          alt={name}
                          style={{ width: 20, height: 20, borderRadius: "50%" }}
                        />
                      </span>
                    )}
                    {name}
                  </button>
                </SwiperSlide>
              );
            })}
      </NavSwiper>
    </div>
  );
}

const Navbar = memo(Component);
export { Navbar };
