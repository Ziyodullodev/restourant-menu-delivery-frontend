import { useState } from "react";
import "./card.scss";
import { numberDigits } from "@/helpers/number-digits";
import { PluseIcon } from "../icons/pluse-icon";
import { MinusIcon } from "../icons/minus-icon";
import { useCart } from "@/contexts/cart-context";
import { useI18n } from "@/contexts/i18n-context";
import { IProduct, IAddon } from "../mock/mock";
import { ProductModal } from "../product-modal/product-modal";

interface IProps {
  product: IProduct;
}

export function Card(props: IProps): React.ReactElement {
  const { product } = props;
  const { addItem, updateQuantity, items } = useCart();
  const { t, language } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Find item in cart (ignoring addons for the main counter display? No, should check total quantity of this product ID?)
  // Actually, if we have multiple variants of same product, we should probably show total quantity or just "Add" button?
  // User request: "when clicking on card, modal opens".
  // If we have items in cart, do we still open modal to add MORE? Yes.
  // Do we show counter on card?
  // If we have 1 burger with cheese and 1 without, total is 2.
  // The card should probably show total quantity of this productId.

  const cartItems = items.filter((item) => item.productId === product.id);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const productName = product.name[language as "ru" | "uz"];
  const productDescription = product.description[language as "ru" | "uz"];

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  const handleAddToCart = (product: IProduct, addons: IAddon[]) => {
    addItem({
      productId: product.id,
      name: productName, // Use localized name
      price: product.price + addons.reduce((sum, a) => sum + a.price, 0),
      image: product.image,
      weight: product.weight,
      addons: addons,
    });
    setIsModalOpen(false);
  };

  // For decrement, if we have multiple variants, which one do we remove?
  // This is tricky. Usually if customisation is involved, main card just opens product page/modal.
  // Simplification: The "Plus/Minus" counter on the card might be confusing if multiple variants exist.
  // If we strictly follow "clicking card opens modal", then the card should act as a detailed view trigger.
  // BUT the current UI has a counter on the card.
  // Let's assume:
  // 1. If NO items of this product in cart -> Button "Add" -> Opens Modal.
  // 2. If ITEMS exist -> Display counter (total).
  //    - Plus -> Opens Modal (to add another one, possibly with diff options).
  //    - Minus -> Removes the LAST added item of this product? Or opens a list of variants to remove?
  //    - Simpler approach for MVP: Minus removes the most recent addition or just one instance.
  //    - Even simpler: The card always opens the modal when clicking, and inside modal you can add. 
  //    - User said: "when clicking on card from bottom comes modal".
  //    - Maybe the counter on the card is not needed if we go full customization?
  //    - Let's keep the counter but make "+" open modal. 
  //    - "-" will remove the last added variant (LIFO) for simplicity.

  const increment = () => {
    setIsModalOpen(true);
  };

  const decrement = () => {
    if (cartItems.length > 0) {
      // Find the last added item (or just the first one found) and decrease its quantity
      const lastItem = cartItems[cartItems.length - 1]; // or sort by time if we had it
      updateQuantity(lastItem.id, lastItem.quantity - 1);
    }
  };

  const isCounterShow = totalQuantity > 0;

  return (
    <>
      <div className="card">
        <div className="card__wrap">
          <div className="card__image-wrap" onClick={handleAddClick}>
            <img src={product.image} alt={productName} className="card__image" />
          </div>

          <div className="card__description">
            <p className="card__name" onClick={handleAddClick}>{productName}</p>
            <p className="card__info" onClick={handleAddClick}>{productDescription}</p>
            <div className="card__meta">
              <span className="card__measure">{product.weight}</span>
              <span className="card__time">{product.time}</span>
            </div>
            <span className="card__price" style={{ color: "var(--price-color)" }}>
              {numberDigits(product.price)} {t.sum}
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
