import "./success-modal.scss";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: "ru" | "uz";
}

export function SuccessModal({
  isOpen,
  onClose,
  language,
}: SuccessModalProps): React.ReactElement | null {
  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-modal__icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" stroke="#20AD4E" strokeWidth="4" />
            <path
              d="M18 32L28 42L46 24"
              stroke="#20AD4E"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="success-modal__title">
          {language === "ru"
            ? "Ваш заказ оформлен!"
            : "Buyurtmangiz qabul qilindi!"}
        </h2>
        <p className="success-modal__text">
          {language === "ru"
            ? "Спасибо за заказ. Вы можете отслеживать его статус в разделе 'Заказы'."
            : "Buyurtma uchun rahmat. Uni holatini 'Buyurtmalar' bo'limida kuzatishingiz mumkin."}
        </p>
        <button className="success-modal__button" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
