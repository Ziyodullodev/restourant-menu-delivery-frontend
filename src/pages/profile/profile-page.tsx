import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import "./profile-page.scss";

export function ProfilePage(): React.ReactElement {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const { authData } = useAuth();

  const menuItems = [
    {
      icon: "🏪",
      label: language === "ru" ? "Наши филиалы" : "Bizning filiallar",
      onClick: () => navigate("/branches"),
    },

    {
      icon: "💬",
      label: language === "ru" ? "Обратная связь" : "Fikr-mulohaza",
      onClick: () => navigate("/feedback"),
    },
    {
      icon: "ℹ️",
      label: t.aboutUs,
      onClick: () => navigate("/about"),
    },
    {
      icon: "🔒",
      label: t.privacyPolicy,
      onClick: () => navigate("/privacy"),
    },
  ];

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h1 className="profile-page__title">{t.profileTitle}</h1>
      </div>

      <div
        className="profile-page__user-card"
        onClick={() => navigate("/about")}
      >
        <div className="profile-page__avatar">
          {authData?.session?.organization?.logo ? (
            <img
              src={authData.session.organization.logo}
              alt="logo"
              className="profile-page__avatar-logo"
            />
          ) : authData?.session?.organization?.logo_svg ? (
            <img
              src={authData.session.organization.logo_svg}
              alt="logo"
              className="profile-page__avatar-logo"
            />
          ) : (
            <span className="profile-page__avatar-letter">
              {(language === "ru"
                ? authData?.session?.organization?.name_ru
                : authData?.session?.organization?.name_uz
              )?.charAt(0) || "R"}
            </span>
          )}
        </div>
        <div className="profile-page__user-info">
          <h2 className="profile-page__user-name">
            {language === "ru"
              ? authData?.session?.organization?.name_ru
              : authData?.session?.organization?.name_uz || "Restoran"}
          </h2>
          <p className="profile-page__user-phone">
            📍 {authData?.session?.organization?.adress_name || ""}
          </p>
        </div>
      </div>

      <div className="profile-page__menu">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="profile-page__menu-item"
            onClick={item.onClick}
          >
            <div className="profile-page__menu-icon">{item.icon}</div>
            <span className="profile-page__menu-label">{item.label}</span>
            <svg
              className="profile-page__menu-arrow"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 15L12.5 10L7.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </div>

      {authData?.session?.organization?.telegram_account && (
        <div className="profile-page__support">
          <p className="profile-page__support-label">{t.support}</p>
          <button
            className="profile-page__contact-btn"
            onClick={() => {
              const account =
                authData.session.organization.telegram_account?.replace(
                  "@",
                  "",
                );
              window.open(`https://t.me/${account}`, "_blank");
            }}
          >
            <div className="profile-page__contact-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span>{t.contactUs}</span>
          </button>
        </div>
      )}
    </div>
  );
}
