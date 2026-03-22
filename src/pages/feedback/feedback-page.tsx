import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { createFeedback } from "@/services/api.service";
import "./feedback-page.scss";

const FEEDBACK_CATEGORIES = [
  { id: "service", labelUz: "Xizmat", labelRu: "Сервис" },
  { id: "waiter", labelUz: "Ofitsiant", labelRu: "Официант" },
  { id: "food", labelUz: "Ovqatlar", labelRu: "Еда" },
  { id: "atmosphere", labelUz: "Atmosfera", labelRu: "Атмосфера" },
  { id: "price", labelUz: "Narx", labelRu: "Цена" },
  { id: "other", labelUz: "Boshqa", labelRu: "Другое" },
];

export function FeedbackPage(): React.ReactElement {
  const navigate = useNavigate();
  const { language } = useI18n();
  const { authData } = useAuth();
  const [rating, setRating] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    const branchId = authData?.session?.organization?.id;
    if (!branchId || rating === 0) return;

    setIsSubmitting(true);
    try {
      await createFeedback({
        branch: branchId,
        star_rating: rating,
        categories: selectedCategories,
        comment,
      });
      setIsSuccess(true);
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      console.error("Feedback submit error:", err);
      alert(language === "ru" ? "Xatolik yuz berdi" : "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="feedback-success">
        <div className="feedback-success__content">
          <div className="feedback-success__icon">✅</div>
          <h2>{language === "ru" ? "Rahmat!" : "Rahmat!"}</h2>
          <p>
            {language === "ru"
              ? "Sizning fikringiz biz uchun muhim."
              : "Sizning fikringiz biz uchun muhim."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <div className="feedback-page__header">
        <button className="feedback-page__back" onClick={() => navigate(-1)}>
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
        <h1 className="feedback-page__title">
          {language === "ru" ? "Обратная связь" : "Fikr-mulohaza"}
        </h1>
      </div>

      <div className="feedback-page__content">
        <div className="feedback-section">
          <h3 className="feedback-section__title">
            {language === "ru" ? "Kak vi nas otsenivaete?" : "Qanday baholaysiz?"}
          </h3>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-button ${rating >= star ? "active" : ""}`}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="feedback-section">
          <h3 className="feedback-section__title">
            {language === "ru"
              ? "Chto vam ponravilos?"
              : "Sizga nima yoqdi?"}
          </h3>
          <div className="category-pills">
            {FEEDBACK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`category-pill ${
                  selectedCategories.includes(cat.id) ? "active" : ""
                }`}
                onClick={() => toggleCategory(cat.id)}
              >
                {language === "ru" ? cat.labelRu : cat.labelUz}
              </button>
            ))}
          </div>
        </div>

        <div className="feedback-section">
          <h3 className="feedback-section__title">
            {language === "ru" ? "Vash kommentariy" : "Izohingiz"}
          </h3>
          <textarea
            className="comment-textarea"
            placeholder={
              language === "ru" ? "Napishite zdes..." : "Shu yerda yozing..."
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button
          className="submit-feedback-btn"
          disabled={rating === 0 || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting
            ? language === "ru"
              ? "Otpravka..."
              : "Yuborilmoqda..."
            : language === "ru"
            ? "Otpravit"
            : "Yuborish"}
        </button>
      </div>
    </div>
  );
}
