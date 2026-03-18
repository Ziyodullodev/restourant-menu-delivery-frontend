import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/i18n-context";
import { AddCardModal } from "@/components/add-card-modal/add-card-modal";
import "./bank-cards-page.scss";

interface BankCard {
  id: string;
  lastFourDigits: string;
  expiryDate: string;
  balance: number;
}

export function BankCardsPage(): React.ReactElement {
  const navigate = useNavigate();
  const { language } = useI18n();

  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  // Mock data - replace with actual data from API
  const [cards, setCards] = useState<BankCard[]>([
    // Uncomment to show card example:
    // {
    //   id: "1",
    //   lastFourDigits: "1237",
    //   expiryDate: "06/30",
    //   balance: 14860.97,
    // },
  ]);

  const handleAddCard = (cardNumber: string, expiryDate: string) => {
    const lastFourDigits = cardNumber.replace(/\s/g, "").slice(-4);
    const newCard: BankCard = {
      id: Date.now().toString(),
      lastFourDigits,
      expiryDate,
      balance: 0,
    };
    setCards([...cards, newCard]);
  };

  return (
    <div className="bank-cards-page">
      <div className="bank-cards-page__header">
        <button
          className="bank-cards-page__back"
          onClick={() => navigate("/profile")}
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
        <h1 className="bank-cards-page__title">
          {language === "ru" ? "Банковские карты" : "Bank kartalari"}
        </h1>
        {cards.length > 0 && (
          <button
            className="bank-cards-page__add-btn"
            onClick={() => setIsAddCardModalOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4V16M4 10H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {language === "ru" ? "Добавить" : "Qo'shish"}
          </button>
        )}
      </div>

      <div className="bank-cards-page__content">
        {cards.length === 0 ? (
          <div className="bank-cards-empty">
            <div className="bank-cards-empty__icon">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect
                  x="10"
                  y="20"
                  width="60"
                  height="40"
                  rx="6"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path d="M10 32H70" stroke="currentColor" strokeWidth="3" />
              </svg>
            </div>
            <h2 className="bank-cards-empty__title">
              {language === "ru"
                ? "Нет сохраненных карт"
                : "Saqlangan kartalar yo'q"}
            </h2>
            <p className="bank-cards-empty__description">
              {language === "ru"
                ? "Добавьте банковскую карту для быстрой оплаты заказов"
                : "Buyurtmalarni tez to'lash uchun bank kartasini qo'shing"}
            </p>
            <button
              className="bank-cards-empty__add-btn"
              onClick={() => setIsAddCardModalOpen(true)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 4V16M4 10H16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {language === "ru" ? "Добавить карту" : "Karta qo'shish"}
            </button>
            <p className="bank-cards-empty__security">
              {language === "ru"
                ? "Ваши карты надежно защищены и используются только для оплаты заказов"
                : "Sizning kartalaringiz ishonchli himoyalangan va faqat buyurtmalarni to'lash uchun ishlatiladi"}
            </p>
          </div>
        ) : (
          <div className="bank-cards-list">
            {cards.map((card) => (
              <div key={card.id} className="bank-card">
                <div className="bank-card__header">
                  <div className="bank-card__icon">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <rect
                        x="2"
                        y="6"
                        width="28"
                        height="20"
                        rx="3"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M2 12H30"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <button className="bank-card__delete">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
                <div className="bank-card__number">
                  •••• •••• •••• {card.lastFourDigits}
                </div>
                <div className="bank-card__footer">
                  <div className="bank-card__expiry">
                    <span className="bank-card__label">
                      {language === "ru"
                        ? "Срок действия"
                        : "Amal qilish muddati"}
                    </span>
                    <span className="bank-card__value">{card.expiryDate}</span>
                  </div>
                  <div className="bank-card__balance">
                    <span className="bank-card__label">
                      {language === "ru" ? "Баланс" : "Balans"}
                    </span>
                    <span className="bank-card__value">
                      {card.balance.toLocaleString("ru-RU", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {language === "ru" ? "сум" : "so'm"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <p className="bank-cards-list__security">
              {language === "ru"
                ? "Ваши карты надежно защищены и используются только для оплаты заказов"
                : "Sizning kartalaringiz ishonchli himoyalangan va faqat buyurtmalarni to'lash uchun ishlatiladi"}
            </p>
          </div>
        )}
      </div>

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        onAdd={handleAddCard}
        language={language}
      />
    </div>
  );
}
