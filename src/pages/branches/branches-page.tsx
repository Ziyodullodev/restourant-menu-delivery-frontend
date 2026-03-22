import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { fetchBranches } from "@/services/api.service";
import { IApiBranch } from "@/types/api.types";
import "./branches-page.scss";

export function BranchesPage(): React.ReactElement {
  const navigate = useNavigate();
  const { language } = useI18n();
  const { authData } = useAuth();
  const [branches, setBranches] = useState<IApiBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentBranchId = authData?.session?.organization?.id;
    if (!currentBranchId) return;

    fetchBranches(currentBranchId)
      .then(setBranches)
      .catch((err) => console.error("Branches fetch error:", err))
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

  return (
    <div className="branches-page">
      <div className="branches-page__header">
        <button className="branches-page__back" onClick={() => navigate(-1)}>
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
        <h1 className="branches-page__title">
          {language === "ru" ? "Наши филиалы" : "Bizning filiallar"}
        </h1>
      </div>

      <div className="branches-page__content">
        {isLoading ? (
          <div className="branches-page__loading">...</div>
        ) : branches.length === 0 ? (
          <div className="branches-page__empty">
            <p>
              {language === "ru" ? "Филиалы не найдены" : "Filiallar topilmadi"}
            </p>
          </div>
        ) : (
          <div className="branches-list">
            {branches.map((branch) => {
              const name =
                language === "uz"
                  ? branch.name_uz
                  : branch.name_ru || branch.name_uz;
              const isOpen =
                branch.is_active &&
                checkIsOpen(branch.working_start_time, branch.working_end_time);

              return (
                <div key={branch.id} className="branch-card">
                  <div className="branch-card__logo-wrap">
                    {branch.logo || branch.logo_svg ? (
                      <img
                        src={branch.logo || branch.logo_svg || ""}
                        alt={name}
                        className="branch-card__logo"
                      />
                    ) : (
                      <div className="branch-card__placeholder">🏢</div>
                    )}
                  </div>
                  <div className="branch-card__info">
                    <h3 className="branch-card__name">{name}</h3>
                    <p className="branch-card__address">📍 {branch.adress_name}</p>
                    <div className="branch-card__meta">
                      {branch.has_delivery && (
                        <span className="branch-card__badge branch-card__badge--delivery">
                          {language === "uz"
                            ? "Yetkazib berish mavjud"
                            : "Доставка доступна"}
                        </span>
                      )}
                      {(branch.working_start_time || branch.working_end_time) && (
                        <span className="branch-card__badge branch-card__badge--time">
                          🕒 {branch.working_start_time?.slice(0, 5)} -{" "}
                          {branch.working_end_time?.slice(0, 5)}
                        </span>
                      )}
                      {isOpen ? (
                        <span className="branch-card__badge branch-card__badge--active">
                          {language === "uz" ? "Ochiq" : "Открыто"}
                        </span>
                      ) : (
                        <span className="branch-card__badge branch-card__badge--closed">
                          {language === "uz" ? "Yopiq" : "Закрыto"}
                        </span>
                      )}
                    </div>
                    <div className="branch-card__socials">
                      {branch.telegram_channel && (
                        <a
                          href={`https://t.me/${branch.telegram_channel.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="branch-card__social-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          ✈️
                        </a>
                      )}
                      {branch.instagram && (
                        <a
                          href={`https://instagram.com/${branch.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="branch-card__social-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          📸
                        </a>
                      )}
                      {branch.whatsapp && (
                        <a
                          href={`https://wa.me/${branch.whatsapp.replace("+", "").replace(" ", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="branch-card__social-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          💬
                        </a>
                      )}
                    </div>
                  </div>
                  {branch.latitude && branch.longitude && (
                    <a
                      href={`https://maps.google.com/?q=${branch.latitude},${branch.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="branch-card__map-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle
                          cx="12"
                          cy="10"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
