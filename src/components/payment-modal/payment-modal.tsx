import "./payment-modal.scss";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (method: string) => void;
  language: "ru" | "uz";
}

export function PaymentModal({
  isOpen,
  onClose,
  onSelect,
  language,
}: PaymentModalProps): React.ReactElement | null {
  if (!isOpen) return null;

  const paymentMethods = [
    {
      id: "cash",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect
            x="2"
            y="6"
            width="20"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M6 10H6.01M18 10H18.01M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
      label: language === "ru" ? "Наличные" : "Naqd pul",
      color: "#20AD4E",
    },
    {
      id: "uzcard",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect
            x="2"
            y="5"
            width="20"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      label: language === "ru" ? "Карта UzCard" : "UzCard karta",
      color: "#4A90E2",
    },
    {
      id: "online",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M2 12H22M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22M12 2C9.5 4.5 8 8 8 12C8 16 9.5 19.5 12 22"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
      label: language === "ru" ? "Онлайн оплата" : "Onlayn to'lov",
      color: "#9B59B6",
    },
  ];

  const handleSelect = (methodId: string) => {
    onSelect(methodId);
    onClose();
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal__header">
          <h2 className="payment-modal__title">
            {language === "ru" ? "Способ оплаты" : "To'lov usuli"}
          </h2>
          <button className="payment-modal__close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="payment-modal__methods">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              className="payment-method-item"
              onClick={() => handleSelect(method.id)}
            >
              <div
                className="payment-method-item__icon"
                style={{ color: method.color }}
              >
                {method.icon}
              </div>
              <span className="payment-method-item__label">{method.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
