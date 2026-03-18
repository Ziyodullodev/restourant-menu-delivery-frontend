import { useState, useEffect } from "react";
import { IApiProduct, IApiAddon } from "@/types/api.types";
import { useI18n } from "@/contexts/i18n-context";
import { numberDigits } from "@/helpers/number-digits";
import "./product-modal.scss";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: IApiProduct | null;
  onAddToCart: (product: IApiProduct, addons: IApiAddon[]) => void;
}

export function ProductModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
}: ProductModalProps): React.ReactElement | null {
  const { t, language } = useI18n();
  const [selectedAddons, setSelectedAddons] = useState<IApiAddon[]>([]);

  useEffect(() => {
    if (isOpen) setSelectedAddons([]);
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const productName = language === "uz" ? product.name_uz : product.name_ru;
  const productDesc =
    language === "uz"
      ? (product.description_uz ?? "")
      : (product.description_ru ?? "");

  /* const toggleAddon = (addon: IApiAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.id === addon.id);
      return exists ? prev.filter((a) => a.id !== addon.id) : [...prev, addon];
    });
  }; */

  const addonsPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = product.current_price + addonsPrice;

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="product-modal__header">
          <div className="product-modal__image-wrap">
            {product.medium_image || product.original_image ? (
              <img
                src={product.medium_image || product.original_image}
                alt={productName}
                className="product-modal__image"
              />
            ) : (
              <div className="product-modal__image-placeholder">🍽️</div>
            )}
          </div>
          <div className="product-modal__info">
            <h3 className="product-modal__title">{productName}</h3>
            <p className="product-modal__desc">{productDesc}</p>
            <span className="product-modal__price">
              {numberDigits(totalPrice)} {t.sum}
            </span>
          </div>
        </div>

        {/* {product.addons && product.addons.length > 0 && (
          <div className="product-modal__addons">
            <h4 className="product-modal__addons-title">
              {language === "ru"
                ? "Добавить к заказу?"
                : "Buyurtmaga qo'shasizmi?"}
            </h4>
            {product.addons.map((addon) => {
              const isSelected = selectedAddons.some((a) => a.id === addon.id);
              const name = language === "uz" ? addon.name_uz : addon.name_ru;
              return (
                <div
                  key={addon.id}
                  className={`product-modal__addon ${isSelected ? "product-modal__addon--selected" : ""}`}
                  onClick={() => toggleAddon(addon)}
                >
                  <div className="product-modal__addon-info">
                    <span className="product-modal__addon-name">{name}</span>
                    <span className="product-modal__addon-price">
                      + {numberDigits(addon.price)} {t.sum}
                    </span>
                  </div>
                  <div
                    className={`product-modal__checkbox ${isSelected ? "product-modal__checkbox--checked" : ""}`}
                  />
                </div>
              );
            })}
          </div>
        )} */}

        <div className="product-modal__footer">
          <button
            className="product-modal__submit"
            onClick={() => {
              onAddToCart(product, selectedAddons);
              onClose();
            }}
          >
            {t.addToCart} • {numberDigits(totalPrice)} {t.sum}
          </button>
        </div>
      </div>
    </div>
  );
}
