import { useState } from "react";
import "./card.scss";
import { numberDigits } from "@/helpers/number-digits";
import { PluseIcon } from "../icons/pluse-icon";
import { MinusIcon } from "../icons/minus-icon";
import { useCart } from "@/contexts/cart-context";
import { useI18n } from "@/contexts/i18n-context";
import { IApiProduct, IApiAddon } from "@/types/api.types";
import { ProductModal } from "../product-modal/product-modal";

interface IProps {
  product: IApiProduct;
}

export function Card(props: IProps): React.ReactElement {
  const { product } = props;
  const { addItem, updateQuantity, items, cartSummary } = useCart();
  const { t, language } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const productName = language === "uz" ? product.name_uz : product.name_ru;
  const productDescription =
    language === "uz"
      ? (product.description_uz ?? "")
      : (product.description_ru ?? "");

  // cart-summary dan mahsulot miqdorini olamiz (server haqiqati)
  const serverQty = cartSummary[product.id] ?? 0;

  // Local cart dan ham tekshiramiz (optimistic UI)
  const cartItems = items.filter((item) => item.productId === product.id);
  const localQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Server yoki lokal — qaysi katta bo'lsa shuni ko'rsatamiz
  const totalQuantity = Math.max(serverQty, localQty);
  const isCounterShow = totalQuantity > 0;

  const handleAddClick = () => setIsModalOpen(true);

  const handleAddToCart = (prod: IApiProduct, addons: IApiAddon[]) => {
    const addonPrice = addons.reduce((sum, a) => a.price + sum, 0);
    addItem({
      productId: prod.id,
      name: productName,
      price: prod.current_price + addonPrice,
      image: prod.medium_image || prod.original_image || "",
      weight: prod.product_weight ? `${prod.product_weight} g` : "",
      addons,
    });
    setIsModalOpen(false);
  };

  const increment = () => setIsModalOpen(true);

  const decrement = () => {
    if (cartItems.length > 0) {
      const lastItem = cartItems[cartItems.length - 1];
      updateQuantity(lastItem.id, lastItem.quantity - 1);
    }
  };

  return (
    <>
      <div className="card">
        <div className="card__wrap">
          <div className="card__image-wrap" onClick={handleAddClick}>
            {product.medium_image || product.original_image ? (
              <img
                src={product.medium_image || product.original_image}
                alt={productName}
                className="card__image"
              />
            ) : (
              <div className="card__image-placeholder">🍽️</div>
            )}
          </div>

          <div className="card__description">
            <p className="card__name" onClick={handleAddClick}>
              {productName}
            </p>
            <p className="card__info" onClick={handleAddClick}>
              {productDescription}
            </p>
            <div className="card__meta">
              {product.product_weight > 0 && (
                <span className="card__measure">
                  {product.product_weight} g
                </span>
              )}
              {product.estimate_time > 0 && (
                <span className="card__time">~{product.estimate_time} min</span>
              )}
            </div>
            <span
              className="card__price"
              style={{ color: "var(--price-color)" }}
            >
              {numberDigits(product.current_price)} {t.sum}
            </span>
          </div>
        </div>

        {isCounterShow ? (
          <div className="card__counter">
            <button className="card__counter-btn" onClick={decrement}>
              <MinusIcon width={20} height={20} />
            </button>
            <span>{totalQuantity}</span>
            <button className="card__counter-btn" onClick={increment}>
              <PluseIcon width={20} height={20} />
            </button>
          </div>
        ) : (
          <button className="card__btn" onClick={handleAddClick}>
            <span>{t.addToCart}</span>
            <PluseIcon width={18} height={18} />
          </button>
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
