import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { useSwipeBack } from "@/helpers/use-swipe-back";
import "./privacy-page.scss";

interface IPrivacyData {
  id: string;
  privacy_policy_uz: string | null;
  privacy_policy_ru: string | null;
  privacy_policy_en: string | null;
}

const BASE_URL = "https://backend-v1.menio.uz/api";

export function PrivacyPage(): React.ReactElement {
  const navigate = useNavigate();
  const { language } = useI18n();
  const { authData } = useAuth();
  const [data, setData] = useState<IPrivacyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useSwipeBack();

  useEffect(() => {
    const branchId = authData?.organization?.id;
    if (!branchId) return;

    const token = (() => {
      try {
        const raw = localStorage.getItem("auth_data");
        return raw ? JSON.parse(raw)?.access : null;
      } catch {
        return null;
      }
    })();

    // Endpoint nomini /r-client/privacy/ deb faraz qiling (About kabi)
    fetch(`${BASE_URL}/r-client/privacy/?branch_id=${branchId}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Privacy fetch error:", err))
      .finally(() => setIsLoading(false));
  }, [authData]);

  const policy =
    language === "uz" ? data?.privacy_policy_uz : data?.privacy_policy_ru || data?.privacy_policy_uz;

  return (
    <div className="privacy-page">
      <div className="privacy-page__header">
        <button className="privacy-page__back" onClick={() => navigate(-1)}>
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
        <h1 className="privacy-page__title">
          {language === "uz" ? "Maxfiylik siyosati" : "Политика конфиденциальности"}
        </h1>
      </div>

      <div className="privacy-page__content">
        {isLoading ? (
          <div className="privacy-page__loading">...</div>
        ) : policy ? (
           <div 
             className="privacy-page__text"
             dangerouslySetInnerHTML={{ __html: policy }} 
           />
        ) : (
          <div className="privacy-page__empty">
            <p>
              {language === "uz" ? "Ma'lumot topilmadi" : "Информация не найдена"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
