import { useState, useEffect } from "react";
import { IProduct, IAddon } from "../mock/mock";
import { useI18n } from "@/contexts/i18n-context";
import { numberDigits } from "@/helpers/number-digits";
import "./product-modal.scss";

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: IProduct | null;
    onAddToCart: (product: IProduct, addons: IAddon[]) => void;
}

export function ProductModal({ isOpen, onClose, product, onAddToCart }: ProductModalProps): React.ReactElement | null {
    const { t, language } = useI18n();
    const [selectedAddons, setSelectedAddons] = useState<IAddon[]>([]);

    // Reset state when modal opens with a new product
    useEffect(() => {
        if (isOpen) {
            setSelectedAddons([]);
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const productName = product.name[language as "ru" | "uz"];
    const productDesc = product.description[language as "ru" | "uz"];

    const toggleAddon = (addon: IAddon) => {
        setSelectedAddons((prev) => {
            const exists = prev.find((a) => a.id === addon.id);
            if (exists) {
                return prev.filter((a) => a.id !== addon.id);
            } else {
                return [...prev, addon];
            }
        });
    };

    const addonsPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    const totalPrice = product.price + addonsPrice;

    return (
        <div className="product-modal-overlay" onClick={onClose}>
            <div className="product-modal" onClick={(e) => e.stopPropagation()}>
                <div className="product-modal__header">
                    <div className="product-modal__image-wrap">
                        <img src={product.image} alt={productName} className="product-modal__image" />
                    </div>
                    <div className="product-modal__info">
                        <h3 className="product-modal__title">{productName}</h3>
                        <p className="product-modal__desc">{productDesc}</p>
                        <span className="product-modal__price">
                            {numberDigits(totalPrice)} {t.sum}
                        </span>
                    </div>
                </div>

                {product.addons && product.addons.length > 0 && (
                    <div className="product-modal__addons">
                        <h4 className="product-modal__addons-title">
                            {language === "ru" ? "Добавить к заказу?" : "Buyurtmaga qo'shasizmi?"}
                        </h4>
                        {product.addons.map((addon) => {
                            const isSelected = selectedAddons.some((a) => a.id === addon.id);
                            const name = addon.name[language as "ru" | "uz"];
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
                                    <div className={`product-modal__checkbox ${isSelected ? "product-modal__checkbox--checked" : ""}`} />
                                </div>
                            );
                        })}
                    </div>
                )}

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
