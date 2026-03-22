import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import "./about-page.scss";

interface IAboutData {
  id: string;
  name_uz: string;
  name_ru: string | null;
  name_en: string | null;
  about_uz: string | null;
  about_ru: string | null;
  about_en: string | null;
  contact_number: string | null;
  contact_email: string | null;
  telegram_account: string | null;
  logo: string | null;
  logo_svg: string | null;
  longitude: string | null;
  latitude: string | null;
  adress_name: string | null;
  has_delivery: boolean;
  is_active: boolean;
  working_start_time?: string;
  working_end_time?: string;
  telegram_channel?: string;
  instagram?: string;
  whatsapp?: string;
  telegram_chat_id?: string;
}

const BASE_URL = "https://backend-v1.menio.uz/api";

export function AboutPage(): React.ReactElement {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const { authData } = useAuth();
  const [data, setData] = useState<IAboutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const branchId = authData?.session?.organization?.id;
    if (!branchId) return;

    const token = (() => {
      try {
        const raw = localStorage.getItem("auth_data");
        return raw ? JSON.parse(raw)?.access : null;
      } catch {
        return null;
      }
    })();

    fetch(`${BASE_URL}/r-client/about/?branch_id=${branchId}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("About fetch error:", err))
      .finally(() => setIsLoading(false));
  }, [authData]);

  const checkIsOpen = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return true;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;

    if (endMinutes < startMinutes) {
      if (currentMinutes >= startMinutes || currentMinutes <= endMinutes) {
        return true;
      }
    } else {
      if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        return true;
      }
    }

    return false;
  };

  const name =
    language === "uz" ? data?.name_uz : data?.name_ru || data?.name_uz;
  const about =
    language === "uz" ? data?.about_uz : data?.about_ru || data?.about_uz;

  return (
    <div className="about-page">
      <div className="about-page__header">
        <button className="about-page__back" onClick={() => navigate(-1)}>
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
        <h1 className="about-page__title">{t.aboutUs}</h1>
      </div>

      {isLoading ? (
        <div className="about-page__skeleton">
          <div className="about-page__skeleton-logo" />
          <div className="about-page__skeleton-line about-page__skeleton-line--wide" />
          <div className="about-page__skeleton-line" />
          <div className="about-page__skeleton-line about-page__skeleton-line--short" />
        </div>
      ) : data ? (
        <>
          {/* Logo va Restaurant nomi */}
          <div className="about-page__hero">
            {data.logo ? (
              <img
                src={data.logo}
                alt={name || "Logo"}
                className="about-page__logo"
              />
            ) : (
              <div className="about-page__logo-placeholder">
                <span>🍽️</span>
              </div>
            )}
            <h2 className="about-page__name">{name}</h2>
            {data.has_delivery && (
              <div className="about-page__badge">
                {language === "uz"
                  ? "🚗 Yetkazib berish mavjud"
                  : "🚗 Доставка доступна"}
              </div>
            )}
            {(data.working_start_time || data.working_end_time) && (
              <div className="about-page__working-time">
                🕒 {data.working_start_time?.slice(0, 5)} -{" "}
                {data.working_end_time?.slice(0, 5)}
              </div>
            )}
            <div
              className={`about-page__status ${
                data.is_active &&
                checkIsOpen(data.working_start_time, data.working_end_time)
                  ? "about-page__status--active"
                  : "about-page__status--closed"
              }`}
            >
              {data.is_active &&
              checkIsOpen(data.working_start_time, data.working_end_time)
                ? language === "uz"
                  ? "Ochiq"
                  : "Открыто"
                : language === "uz"
                ? "Yopiq"
                : "Закрыто"}
            </div>
          </div>

          {/* Biz haqimizda matni */}
          {about && (
            <div className="about-page__section">
              <h3 className="about-page__section-title">
                {language === "uz" ? "Biz haqimizda" : "О нас"}
              </h3>
              <p className="about-page__about-text">{about}</p>
            </div>
          )}

          {/* Kontakt ma'lumotlar */}
          {(data.contact_number ||
            data.contact_email ||
            data.telegram_account ||
            data.instagram ||
            data.whatsapp ||
            data.telegram_channel) && (
            <div className="about-page__section">
              <h3 className="about-page__section-title">
                {language === "uz" ? "Kontaktlar" : "Контакты"}
              </h3>
              <div className="about-page__contacts">
                {data.contact_number && (
                  <a
                    href={`tel:${data.contact_number}`}
                    className="about-page__contact-item"
                  >
                    <div className="about-page__contact-icon about-page__contact-icon--phone">
                      📞
                    </div>
                    <div className="about-page__contact-info">
                      <span className="about-page__contact-label">
                        {language === "uz" ? "Telefon" : "Телефон"}
                      </span>
                      <span className="about-page__contact-value">
                        {data.contact_number}
                      </span>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="about-page__contact-arrow"
                    >
                      <path
                        d="M7.5 15L12.5 10L7.5 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                )}
                {data.telegram_account && (
                  <a
                    href={`https://t.me/${data.telegram_account.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-page__contact-item"
                  >
                    <div className="about-page__contact-icon about-page__contact-icon--tg">
                      ✈️
                    </div>
                    <div className="about-page__contact-info">
                      <span className="about-page__contact-label">
                        Telegram
                      </span>
                      <span className="about-page__contact-value">
                        {data.telegram_account}
                      </span>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="about-page__contact-arrow"
                    >
                      <path
                        d="M7.5 15L12.5 10L7.5 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                )}
                {data.instagram && (
                  <a
                    href={`https://instagram.com/${data.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-page__contact-item"
                  >
                    <div className="about-page__contact-icon about-page__contact-icon--insta">
                      📸
                    </div>
                    <div className="about-page__contact-info">
                      <span className="about-page__contact-label">
                        Instagram
                      </span>
                      <span className="about-page__contact-value">
                        {data.instagram}
                      </span>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="about-page__contact-arrow"
                    >
                      <path
                        d="M7.5 15L12.5 10L7.5 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                )}
                {data.whatsapp && (
                  <a
                    href={`https://wa.me/${data.whatsapp.replace("+", "").replace(" ", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-page__contact-item"
                  >
                    <div className="about-page__contact-icon about-page__contact-icon--wa">
                      💬
                    </div>
                    <div className="about-page__contact-info">
                      <span className="about-page__contact-label">
                        WhatsApp
                      </span>
                      <span className="about-page__contact-value">
                        {data.whatsapp}
                      </span>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="about-page__contact-arrow"
                    >
                      <path
                        d="M7.5 15L12.5 10L7.5 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                )}
                {data.telegram_channel && (
                  <a
                    href={`https://t.me/${data.telegram_channel.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-page__contact-item"
                  >
                    <div className="about-page__contact-icon about-page__contact-icon--tg-channel">
                      📢
                    </div>
                    <div className="about-page__contact-info">
                      <span className="about-page__contact-label">Channel</span>
                      <span className="about-page__contact-value">
                        {data.telegram_channel}
                      </span>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="about-page__contact-arrow"
                    >
                      <path
                        d="M7.5 15L12.5 10L7.5 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                )}
                {data.contact_email && (
                  <a
                    href={`mailto:${data.contact_email}`}
                    className="about-page__contact-item"
                  >
                    <div className="about-page__contact-icon about-page__contact-icon--email">
                      ✉️
                    </div>
                    <div className="about-page__contact-info">
                      <span className="about-page__contact-label">Email</span>
                      <span className="about-page__contact-value">
                        {data.contact_email}
                      </span>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="about-page__contact-arrow"
                    >
                      <path
                        d="M7.5 15L12.5 10L7.5 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Manzil */}
          {(data.adress_name || (data.latitude && data.longitude)) && (
            <div className="about-page__section">
              <h3 className="about-page__section-title">
                {language === "uz" ? "Manzil" : "Адрес"}
              </h3>
              <div className="about-page__map-card">
                <div className="about-page__map-icon">📍</div>
                <div className="about-page__map-info">
                  {data.adress_name && (
                    <span className="about-page__map-address">
                      {data.adress_name}
                    </span>
                  )}
                  {data.latitude && data.longitude && (
                    <a
                      href={`https://maps.google.com/?q=${data.latitude},${data.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-page__map-link"
                    >
                      {language === "uz"
                        ? "Xaritada ko'rish →"
                        : "Смотреть на карте →"}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="about-page__empty">
          <p>
            {language === "uz" ? "Ma'lumot topilmadi" : "Информация не найдена"}
          </p>
        </div>
      )}
    </div>
  );
}
