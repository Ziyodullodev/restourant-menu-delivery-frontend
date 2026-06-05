import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/i18n-context";
import "./delivery-contact-page.scss";

export function DeliveryContactPage(): React.ReactElement {
  const navigate = useNavigate();
  const { language } = useI18n();

  const [phone, setPhone] = useState("+998 ");
  const [comment, setComment] = useState("");

  const isPhoneValid = phone.replace(/\s/g, "").length >= 13;

  const handleNext = () => {
    if (!isPhoneValid) return;
    navigate("/delivery/map", { state: { phone, comment } });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val.startsWith("+998 ")) {
      setPhone("+998 ");
      return;
    }
    setPhone(val);
  };

  const t = {
    title: language === "ru" ? "Доставка" : "Yetkazib berish",
    phoneLabel: language === "ru" ? "Номер телефона" : "Telefon raqam",
    phonePlaceholder: "+998 90 123 45 67",
    commentLabel: language === "ru" ? "Комментарий" : "Izoh",
    commentPlaceholder:
      language === "ru"
        ? "Подъезд, этаж, домофон..."
        : "Kirish, qavat, domofon...",
    next: language === "ru" ? "Далее" : "Keyingi",
  };

  return (
    <div className="delivery-contact-page">
      <div className="delivery-contact-page__header">
        <button
          className="delivery-contact-page__back"
          onClick={() => navigate("/cart")}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="delivery-contact-page__title">{t.title}</h1>
        <div style={{ width: 32 }} />
      </div>

      <div className="delivery-contact-page__body">
        <div className="delivery-contact-page__field">
          <label className="delivery-contact-page__label">{t.phoneLabel}</label>
          <input
            type="tel"
            className="delivery-contact-page__input"
            value={phone}
            onChange={handlePhoneChange}
            placeholder={t.phonePlaceholder}
            autoFocus
          />
        </div>

        <div className="delivery-contact-page__field">
          <label className="delivery-contact-page__label">{t.commentLabel}</label>
          <textarea
            className="delivery-contact-page__textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t.commentPlaceholder}
            rows={3}
          />
        </div>
      </div>

      <div className="delivery-contact-page__footer">
        <button
          className="delivery-contact-page__next-btn"
          onClick={handleNext}
          disabled={!isPhoneValid}
        >
          {t.next}
        </button>
      </div>
    </div>
  );
}
