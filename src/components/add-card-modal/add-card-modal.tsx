import { useState } from "react";
import "./add-card-modal.scss";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (cardNumber: string, expiryDate: string) => void;
  language: "ru" | "uz";
}

type CardType = "humo" | "uzcard" | "unknown";

export function AddCardModal({
  isOpen,
  onClose,
  onAdd,
  language,
}: AddCardModalProps): React.ReactElement | null {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cardType, setCardType] = useState<CardType>("unknown");

  if (!isOpen) return null;

  // Определение типа карты по BIN (первые 6 цифр)
  const detectCardType = (number: string): CardType => {
    const bin = number.replace(/\s/g, "").substring(0, 6);

    // Humo: 9860
    if (bin.startsWith("9860")) {
      return "humo";
    }

    // UzCard: 8600, 5614, 6262
    if (
      bin.startsWith("8600") ||
      bin.startsWith("5614") ||
      bin.startsWith("6262")
    ) {
      return "uzcard";
    }

    return "unknown";
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.substring(0, 16);
    const formatted = limited.match(/.{1,4}/g)?.join(" ") || limited;

    setCardNumber(formatted);
    setCardType(detectCardType(limited));
  };

  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.substring(0, 4);

    if (limited.length >= 2) {
      setExpiryDate(`${limited.substring(0, 2)}/${limited.substring(2)}`);
    } else {
      setExpiryDate(limited);
    }
  };

  const handleAdd = () => {
    if (
      cardNumber.replace(/\s/g, "").length === 16 &&
      expiryDate.length === 5
    ) {
      onAdd(cardNumber, expiryDate);
      setCardNumber("");
      setExpiryDate("");
      setCardType("unknown");
      onClose();
    } else {
      alert(
        language === "ru"
          ? "Заполните все поля корректно"
          : "Barcha maydonlarni to'g'ri to'ldiring",
      );
    }
  };

  const getCardIcon = () => {
    switch (cardType) {
      case "humo":
        return (
          <div className="card-type-badge card-type-badge--humo">
            <span>HUMO</span>
          </div>
        );
      case "uzcard":
        return (
          <div className="card-type-badge card-type-badge--uzcard">
            <span>UzCard</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="add-card-modal-overlay" onClick={onClose}>
      <div className="add-card-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-card-modal__header">
          <h2 className="add-card-modal__title">
            {language === "ru" ? "Добавить карту" : "Karta qo'shish"}
          </h2>
          <button className="add-card-modal__close" onClick={onClose}>
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

        <div className="add-card-modal__content">
          {/* Card Number */}
          <div className="add-card-field">
            <label className="add-card-field__label">
              {language === "ru" ? "Номер карты" : "Karta raqami"}
            </label>
            <div className="add-card-field__input-wrapper">
              {getCardIcon()}
              <input
                type="text"
                className="add-card-field__input"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => formatCardNumber(e.target.value)}
                maxLength={19}
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div className="add-card-field">
            <label className="add-card-field__label">
              {language === "ru" ? "Срок действия" : "Amal qilish muddati"}
            </label>
            <input
              type="text"
              className="add-card-field__input"
              placeholder="MM/ГГ"
              value={expiryDate}
              onChange={(e) => formatExpiryDate(e.target.value)}
              maxLength={5}
            />
          </div>

          <p className="add-card-modal__hint">
            {language === "ru"
              ? "После добавления карты вам будет отправлен SMS с кодом подтверждения"
              : "Karta qo'shilgandan so'ng sizga tasdiqlash kodi yuboriladi"}
          </p>
        </div>

        <div className="add-card-modal__footer">
          <button className="add-card-modal__cancel" onClick={onClose}>
            {language === "ru" ? "Отмена" : "Bekor qilish"}
          </button>
          <button className="add-card-modal__submit" onClick={handleAdd}>
            {language === "ru" ? "Добавить" : "Qo'shish"}
          </button>
        </div>
      </div>
    </div>
  );
}
