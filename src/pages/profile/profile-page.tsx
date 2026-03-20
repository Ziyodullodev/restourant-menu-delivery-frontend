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
      icon: "📍",
      label: t.myAddresses,
      onClick: () => console.log("My Addresses"),
    },
    {
      icon: "🏪",
      label: language === "ru" ? "Наши филиалы" : "Bizning filiallar",
      onClick: () => console.log("Locations"),
    },

    {
      icon: "💬",
      label: language === "ru" ? "Обратная связь" : "Fikr-mulohaza",
      onClick: () => console.log("Feedback"),
    },
    {
      icon: "ℹ️",
      label: t.aboutUs,
      onClick: () => navigate("/about"),
    },
    {
      icon: "🔒",
      label: t.privacyPolicy,
      onClick: () => console.log("Privacy Policy"),
    },
  ];

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h1 className="profile-page__title">{t.profileTitle}</h1>
      </div>

      <div className="profile-page__user-card">
        <div className="profile-page__avatar">
          <span className="profile-page__avatar-letter">
            {authData?.user?.full_name?.charAt(0) || "U"}
          </span>
        </div>
        <div className="profile-page__user-info">
          <h2 className="profile-page__user-name">
            {authData?.user?.full_name || "User"}
          </h2>
          <p className="profile-page__user-phone">
            @{authData?.user?.username || "username"}
          </p>
        </div>
        <button className="profile-page__edit-btn">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.166 2.5009C14.3849 2.28203 14.6447 2.10842 14.9307 1.98996C15.2167 1.87151 15.5232 1.81055 15.8327 1.81055C16.1422 1.81055 16.4487 1.87151 16.7347 1.98996C17.0206 2.10842 17.2805 2.28203 17.4993 2.5009C17.7182 2.71977 17.8918 2.97961 18.0103 3.26558C18.1287 3.55154 18.1897 3.85804 18.1897 4.16757C18.1897 4.4771 18.1287 4.7836 18.0103 5.06956C17.8918 5.35553 17.7182 5.61537 17.4993 5.83424L6.24935 17.0842L1.66602 18.3342L2.91602 13.7509L14.166 2.5009Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
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

      <div className="profile-page__support">
        <p className="profile-page__support-label">{t.support}</p>
        <button className="profile-page__contact-btn">
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
    </div>
  );
}
