import { useEffect, useRef } from "react";
import { Section } from "../section/section";
import { throttle } from "lodash";
import Swiper from "swiper";
import { useMenu } from "@/contexts/menu-context";

interface IProps {
  swiperInstance: Swiper | null;
  setUserScroll: (value: boolean) => void;
  userScroll: boolean;
  setActiveIndex: (value: number) => void;
}

export function ScrollActiveWrapper(props: IProps): React.ReactElement {
  const { swiperInstance, userScroll, setUserScroll, setActiveIndex } = props;
  const sectionContainerRef = useRef<null | HTMLDivElement>(null);
  const sectionOffset = 112;
  const { categories, isLoading, error } = useMenu();

  useEffect(() => {
    const handleScroll = throttle(() => {
      const sectionContainer = sectionContainerRef.current;
      if (!sectionContainer || !userScroll) return;

      const sections =
        sectionContainer.querySelectorAll<HTMLElement>("div.section");
      let currentSectionIndex = 0;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= sectionOffset + 10) {
          currentSectionIndex = index;
        }
      });

      if (currentSectionIndex !== swiperInstance?.activeIndex) {
        setActiveIndex(currentSectionIndex);
        swiperInstance?.slideTo(currentSectionIndex);
      }
    }, 100);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [swiperInstance, userScroll, setActiveIndex]);

  useEffect(() => {
    if (!userScroll) {
      const timer = setTimeout(() => setUserScroll(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [userScroll, setUserScroll]);

  if (error) {
    return (
      <div className="menu-error">
        <p>⚠️ Menyu yuklanmadi</p>
        <small>{error}</small>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div ref={sectionContainerRef} id="sections-container">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="section-skeleton">
            <div className="section-skeleton__title" />
            <div className="section-skeleton__grid">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="card-skeleton" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={sectionContainerRef} id="sections-container">
      {categories.map((category) => (
        <Section key={category.id} category={category} />
      ))}
    </div>
  );
}
