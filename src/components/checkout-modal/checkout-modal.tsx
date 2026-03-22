import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/i18n-context";
import "./checkout-modal.scss";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { phone?: string; comment: string }) => void;
  type: "pickup" | "in_restaurant";
}

export function CheckoutModal({ isOpen, onClose, onConfirm, type }: CheckoutModalProps) {
  const { language } = useI18n();
  const [phone, setPhone] = useState("+998 ");
  const [comment, setComment] = useState("");

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (isOpen && tg) {
      tg.expand();
      tg.MainButton.text = language === "uz" ? "TASDIQLASH" : "ПОДТВЕРДИТЬ";
      tg.MainButton.show();
      
      const onMainClick = () => {
        if (type === "pickup" && phone.length < 13) return;
        onConfirm({ 
          phone: type === "pickup" ? phone : undefined, 
          comment 
        });
      };

      tg.MainButton.onClick(onMainClick);
      
      return () => {
        tg.MainButton.offClick(onMainClick);
        tg.MainButton.hide();
      };
    }
  }, [isOpen, phone, comment, language, type, onConfirm]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg && isOpen) {
      if (type === "pickup" && phone.length < 13) {
        tg.MainButton.disable();
        tg.MainButton.setParams({ color: "#999999" });
      } else {
        tg.MainButton.enable();
        tg.MainButton.setParams({ color: tg.themeParams.button_color || "#F54927" });
      }
    }
  }, [isOpen, phone, type]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("+998 ")) val = "+998 ";
    setPhone(val);
  };

  return (
    <div className="checkout-modal-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="checkout-modal__header">
          <h2 className="checkout-modal__title">
            {type === "pickup" 
              ? (language === "uz" ? "Olib ketish" : "Самовывоз")
              : (language === "uz" ? "Buyurtma" : "Заказ")
            }
          </h2>
          <button className="checkout-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="checkout-modal__content">
          {type === "pickup" && (
            <div className="checkout-modal__field">
              <label>{language === "uz" ? "Telefon" : "Телефон"}</label>
              <input 
                type="tel"
                className="checkout-modal__input"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+998 90 123 45 67"
              />
            </div>
          )}
          
          <div className="checkout-modal__field">
            <label>{language === "uz" ? "Izoh" : "Комментарий"}</label>
            <textarea 
              className="checkout-modal__textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={language === "uz" ? "Masalan: achchiq bo'lmasin..." : "Например: без острых специй..."}
            />
          </div>
        </div>

        <div className="checkout-modal__footer" style={{ display: 'none' }}>
           {/* Managed via Telegram MainButton */}
        </div>
      </div>
    </div>
  );
}
