import Swiper from "swiper";
import { Navbar } from "../navbar/navbar";
import { useI18n, Language } from "@/contexts/i18n-context";
import { useTable } from "@/contexts/table-context";
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
  const { language, setLanguage, t } = useI18n();
  const { tableNumber } = useTable();

  return (
    <header className="header">
      <div className="header__top">
        <div className="header__table">
          <span className="header__table-number">{t.table} #{tableNumber || "1"}</span>
        </div>
        <div className="header__langs">
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

      {/* Removed delivery toggles as requested */}

      <Navbar
        {...{ activeIndex, setActiveIndex, setSwiperInstance, setUserScroll }}
      />
    </header>
  );
}
