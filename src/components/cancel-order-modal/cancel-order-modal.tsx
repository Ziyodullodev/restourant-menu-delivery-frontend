import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/i18n-context";
import "./cancel-order-modal.scss";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export function CancelOrderModal({ isOpen, onClose, onConfirm, isLoading }: CancelOrderModalProps) {
  const { t } = useI18n();
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setReason("");
    }
  }, [isOpen]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (isOpen && tg) {
      tg.MainButton.text = t.confirmCancel || "TASDIQLASH";
      tg.MainButton.show();
      
      const onMainClick = () => {
        if (reason.trim().length > 0 && !isLoading) {
          onConfirm(reason);
        }
      };

      tg.MainButton.onClick(onMainClick);
      
      return () => {
        tg.MainButton.offClick(onMainClick);
        tg.MainButton.hide();
      };
    }
  }, [isOpen, reason, t, onConfirm, isLoading]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg && isOpen) {
      if (reason.trim().length === 0 || isLoading) {
        tg.MainButton.disable();
        tg.MainButton.setParams({ color: "#999999" });
        if (isLoading) tg.MainButton.showProgress(false);
      } else {
        tg.MainButton.enable();
        tg.MainButton.setParams({ color: tg.themeParams.button_color || "#F54927" });
      }
    }
  }, [isOpen, reason, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="cancel-order-modal-overlay" onClick={onClose}>
      <div className="cancel-order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cancel-order-modal__header">
          <h2 className="cancel-order-modal__title">{t.cancelOrder}</h2>
          <button className="cancel-order-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="cancel-order-modal__content">
          <div className="cancel-order-modal__field">
            <label>{t.cancelReasonTitle}</label>
            <textarea
              className="cancel-order-modal__textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.cancelReasonPlaceholder}
              autoFocus
            />
          </div>
        </div>

        <div className="cancel-order-modal__footer" style={{ display: 'none' }}>
           {/* Managed via Telegram MainButton */}
        </div>
      </div>
    </div>
  );
}
