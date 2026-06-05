import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/i18n-context";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { fetchBranches } from "@/services/api.service";
import { IApiBranch } from "@/types/api.types";
import "./pickup-contact-page.scss";

export function PickupContactPage(): React.ReactElement {
  const navigate = useNavigate();
  const { language } = useI18n();
  const { placeOrder } = useCart();
  const { authData } = useAuth();

  const [phone, setPhone] = useState("+998 ");
  const [comment, setComment] = useState("");
  const [branches, setBranches] = useState<IApiBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const selectedBranchData = branches.find((b) => b.id === selectedBranch);

  const isPhoneValid = phone.replace(/\s/g, "").length >= 13;
  const canConfirm = isPhoneValid && !!selectedBranch;

  const t = {
    title:             language === "ru" ? "Самовывоз"              : "Olib ketish",
    phoneLabel:        language === "ru" ? "Номер телефона"         : "Telefon raqam",
    phonePlaceholder:  "+998 90 123 45 67",
    commentLabel:      language === "ru" ? "Комментарий"            : "Izoh",
    commentPlaceholder:language === "ru" ? "Пожелания к заказу..."  : "Buyurtmaga izoh...",
    branchLabel:       language === "ru" ? "Выберите филиал"        : "Filialni tanlang",
    confirm:           language === "ru" ? "Заказать"               : "Buyurtma berish",
    error:             language === "ru" ? "Произошла ошибка"       : "Xatolik yuz berdi",
  };

  useEffect(() => {
    const branchId = authData?.organization?.id;
    fetchBranches(branchId)
      .then((data) => {
        setBranches(data);
        if (data.length > 0) setSelectedBranch(data[0].id);
      })
      .catch(console.error)
      .finally(() => setIsLoadingBranches(false));
  }, [authData]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val.startsWith("+998 ")) {
      setPhone("+998 ");
      return;
    }
    setPhone(val);
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setIsLoading(true);
    try {
      await placeOrder({
        phone,
        comment: comment || undefined,
        delivery_with: "take_away",
        branch: selectedBranch,
      });
      navigate("/orders", { replace: true });
    } catch {
      alert(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pickup-contact-page">
      <div className="pickup-contact-page__header">
        <button
          className="pickup-contact-page__back"
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
        <h1 className="pickup-contact-page__title">{t.title}</h1>
        <div style={{ width: 32 }} />
      </div>

      <div className="pickup-contact-page__body">
        <div className="pickup-contact-page__field">
          <label className="pickup-contact-page__label">{t.phoneLabel}</label>
          <input
            type="tel"
            className="pickup-contact-page__input"
            value={phone}
            onChange={handlePhoneChange}
            placeholder={t.phonePlaceholder}
            autoFocus
          />
        </div>

        <div className="pickup-contact-page__field">
          <label className="pickup-contact-page__label">{t.commentLabel}</label>
          <textarea
            className="pickup-contact-page__textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t.commentPlaceholder}
            rows={3}
          />
        </div>

        <div className="pickup-contact-page__field">
          <label className="pickup-contact-page__label">{t.branchLabel}</label>
          {isLoadingBranches ? (
            <div className="pickup-contact-page__branches-loading">
              <div className="pickup-contact-page__spinner" />
            </div>
          ) : (
            <div className={`pickup-contact-page__dropdown ${isDropdownOpen ? "pickup-contact-page__dropdown--open" : ""}`}>
              <button
                className="pickup-contact-page__dropdown-trigger"
                onClick={() => setIsDropdownOpen((v) => !v)}
              >
                <div className="pickup-contact-page__dropdown-value">
                  {selectedBranchData ? (
                    <>
                      <span className="pickup-contact-page__branch-name">
                        {language === "ru" ? selectedBranchData.name_ru : selectedBranchData.name_uz}
                      </span>
                      {selectedBranchData.adress_name && (
                        <span className="pickup-contact-page__branch-address">
                          {selectedBranchData.adress_name}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="pickup-contact-page__dropdown-placeholder">
                      {t.branchLabel}
                    </span>
                  )}
                </div>
                <svg
                  className="pickup-contact-page__dropdown-arrow"
                  width="20" height="20" viewBox="0 0 24 24" fill="none"
                >
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="pickup-contact-page__dropdown-list">
                  {branches.map((branch) => (
                    <button
                      key={branch.id}
                      className={`pickup-contact-page__dropdown-item ${selectedBranch === branch.id ? "pickup-contact-page__dropdown-item--selected" : ""}`}
                      onClick={() => {
                        setSelectedBranch(branch.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div className="pickup-contact-page__branch-info">
                        <span className="pickup-contact-page__branch-name">
                          {language === "ru" ? branch.name_ru : branch.name_uz}
                        </span>
                        {branch.adress_name && (
                          <span className="pickup-contact-page__branch-address">
                            {branch.adress_name}
                          </span>
                        )}
                      </div>
                      {selectedBranch === branch.id && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12L10 17L19 8" stroke="currentColor"
                            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pickup-contact-page__footer">
        <button
          className="pickup-contact-page__confirm-btn"
          onClick={handleConfirm}
          disabled={!canConfirm || isLoading}
        >
          {isLoading ? "..." : t.confirm}
        </button>
      </div>
    </div>
  );
}
