import { useEffect, useRef } from "react";
import { Section } from "../section/section";
import { throttle } from "lodash";
import Swiper from "swiper";
import { mockData } from "../mock/mock";

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

  useEffect(() => {
    const handleScroll = throttle(() => {
      const sectionContainer = sectionContainerRef.current;
      if (!sectionContainer || !userScroll) return;

      const sections = sectionContainer.querySelectorAll<HTMLElement>("div.section");
      let currentSectionIndex = 0;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        // If the section's top is roughly at the top of the viewport (considering offset)
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

  // Reset userScroll to true after a short delay when navigation clicking finishes
  useEffect(() => {
    if (!userScroll) {
      const timer = setTimeout(() => setUserScroll(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [userScroll, setUserScroll]);

  return (
    <div ref={sectionContainerRef} id="sections-container">
      {mockData?.map((category) => {
        return (
          <Section
            key={category.id}
            category={category}
          />
        );
      })}
    </div>
  );
}
