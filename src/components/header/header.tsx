import Swiper from "swiper";
import { Navbar } from "../navbar/navbar";
import { useI18n, Language } from "@/contexts/i18n-context";
import { OrderTypeSelector } from "../order-type-selector/order-type-selector";
import "./header.scss";

interface IProps {
  setSwiperInstance: React.Dispatch<React.SetStateAction<Swiper | null>>;
  setUserScroll: (value: boolean) => void;
  setActiveIndex: (value: number) => void;
  activeIndex: number;
}
export function Header(props: IProps): React.ReactElement {
  const { activeIndex, setActiveIndex, setSwiperInstance, setUserScroll } =
    props;
  const { language, setLanguage } = useI18n();

  return (
    <header className="header">
      <div className="header__top">
        <OrderTypeSelector />

        <div className="header__langs tour-lang-switcher">
          {(["ru", "uz"] as Language[]).map((l) => (
            <button
              key={l}
              className="header__lang"
              data-active={language === l}
              onClick={() => setLanguage(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <Navbar
        {...{ activeIndex, setActiveIndex, setSwiperInstance, setUserScroll }}
      />
    </header>
  );
}
