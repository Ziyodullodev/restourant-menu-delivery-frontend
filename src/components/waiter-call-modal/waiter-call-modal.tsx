import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { callWaiter } from "@/services/api.service";
import "./waiter-call-modal.scss";

type Reason = "check" | "clean_table" | "napkin" | "other";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId?: string | null;
  branchId?: string;
}

export function WaiterCallModal({ isOpen, onClose, tableId, branchId }: Props) {
  const { language } = useI18n();
  const { authData } = useAuth();
  const [selected, setSelected] = useState<Reason | null>(null);
  const [customText, setCustomText] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const effectiveBranchId = branchId || authData?.organization?.id || "";
  const effectiveTableId = tableId || authData?.table_id || null;
  const effectiveTableNumber = authData?.organization?.table_number ?? null;

  useEffect(() => {
    if (!isOpen) {
      setSelected(null);
      setCustomText("");
      setSuccess(false);
    }
  }, [isOpen]);

  const reasons: { key: Reason; uz: string; ru: string }[] = [
    { key: "check", uz: "Chek olish", ru: "Получить чек" },
    { key: "clean_table", uz: "Stol tozalash", ru: "Убрать стол" },
    { key: "napkin", uz: "Salfetka kerak", ru: "Нужны салфетки" },
    { key: "other", uz: "Boshqa", ru: "Другое" },
  ];

  const canSubmit = selected !== null && (selected !== "other" || customText.trim().length > 0);

  const handleSubmit = async () => {
    if (!canSubmit || loading || !effectiveBranchId) return;
    setLoading(true);
    try {
      await callWaiter({
        branch_id: effectiveBranchId,
        table_id: effectiveTableId,
        table_number: effectiveTableNumber,
        reason: selected!,
        custom_reason: selected === "other" ? customText.trim() : undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      // silent — still close
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wcm-overlay" onClick={onClose}>
      <div className="wcm" onClick={(e) => e.stopPropagation()}>
        <div className="wcm__header">
          <h2 className="wcm__title">
            {language === "uz" ? "🔔 Ofitsant chaqirish" : "🔔 Позвать официанта"}
          </h2>
          <button className="wcm__close" onClick={onClose}>✕</button>
        </div>

        {success ? (
          <div className="wcm__success">
            <span className="wcm__success-icon">✅</span>
            <p>{language === "uz" ? "So'rov yuborildi!" : "Запрос отправлен!"}</p>
          </div>
        ) : (
          <>
            <div className="wcm__reasons">
              {reasons.map((r) => (
                <button
                  key={r.key}
                  className="wcm__reason"
                  data-selected={selected === r.key}
                  onClick={() => setSelected(r.key)}
                >
                  {language === "uz" ? r.uz : r.ru}
                </button>
              ))}
            </div>

            {selected === "other" && (
              <div className="wcm__custom">
                <textarea
                  className="wcm__textarea"
                  placeholder={language === "uz" ? "Sababni kiriting..." : "Введите причину..."}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={3}
                  autoFocus
                />
              </div>
            )}

            <button
              className="wcm__submit"
              disabled={!canSubmit || loading}
              onClick={handleSubmit}
            >
              {loading
                ? (language === "uz" ? "Yuborilmoqda..." : "Отправка...")
                : (language === "uz" ? "Chaqirish" : "Позвать")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
