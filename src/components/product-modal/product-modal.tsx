import { useState, useEffect } from "react";
import { IApiProduct, IApiAddon, IApiIngredientCategory, IApiIngredient } from "@/types/api.types";
import { useI18n } from "@/contexts/i18n-context";
import { useOrderType } from "@/contexts/order-type-context";
import { numberDigits } from "@/helpers/number-digits";
import { MinusIcon } from "@/components/icons/minus-icon";
import { PluseIcon } from "@/components/icons/pluse-icon";
import "./product-modal.scss";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: IApiProduct | null;
  onAddToCart: (product: IApiProduct, addons: IApiAddon[]) => void;
  cartQuantity?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export function ProductModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  cartQuantity = 0,
  onIncrement,
  onDecrement,
}: ProductModalProps): React.ReactElement | null {
  const { t, language } = useI18n();
  const { isOnlyMenu } = useOrderType();
  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (isOpen) setSelectedIngredients({});
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const productName = language === "uz" ? product.name_uz : product.name_ru;
  const productDesc =
    language === "uz"
      ? (product.description_uz ?? "")
      : (product.description_ru ?? "");

  const hasIngredients = (product.ingredient_categories?.length ?? 0) > 0;

  const toggleIngredient = (category: IApiIngredientCategory, ingredient: IApiIngredient) => {
    setSelectedIngredients((prev) => {
      const current = prev[category.id] || [];
      if (category.category_type === "multi-select") {
        const exists = current.includes(ingredient.id);
        return {
          ...prev,
          [category.id]: exists
            ? current.filter((id) => id !== ingredient.id)
            : [...current, ingredient.id],
        };
      } else {
        const isAlreadySelected = current.includes(ingredient.id);
        return { ...prev, [category.id]: isAlreadySelected ? [] : [ingredient.id] };
      }
    });
  };

  const ingredientsAdditionalPrice =
    product.ingredient_categories?.reduce((catSum, category) => {
      const selectedIds = selectedIngredients[category.id] || [];
      return (
        catSum +
        category.ingredients
          .filter((i) => selectedIds.includes(i.id))
          .reduce((sum, i) => sum + i.additional_price, 0)
      );
    }, 0) ?? 0;

  const totalPrice = product.current_price + ingredientsAdditionalPrice;

  const handleSubmit = () => {
    const selectedIngredientAddons: IApiAddon[] =
      product.ingredient_categories?.flatMap((cat) => {
        const selectedIds = selectedIngredients[cat.id] || [];
        return cat.ingredients
          .filter((i) => selectedIds.includes(i.id))
          .map((i) => ({
            id: i.id,
            name_uz: i.name_uz,
            name_ru: i.name_ru,
            name_en: i.name_en,
            price: i.additional_price,
          }));
      }) ?? [];
    onAddToCart(product, selectedIngredientAddons);
  };

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

        {hasIngredients && (
          <div className="product-modal__ingredient-categories">
            {product.ingredient_categories!.map((category) => {
              const catName = language === "uz" ? category.name_uz : category.name_ru;
              const isRadio = category.category_type !== "multi-select";
              return (
                <div key={category.id} className="product-modal__ingredient-category">
                  <h4 className="product-modal__ingredient-category-title">
                    {catName}
                    {category.is_required && (
                      <span className="product-modal__required">*</span>
                    )}
                  </h4>
                  <div className="product-modal__ingredients">
                    {category.ingredients.map((ingredient) => {
                      const isSelected = (selectedIngredients[category.id] || []).includes(ingredient.id);
                      const ingName = language === "uz" ? ingredient.name_uz : ingredient.name_ru;
                      return (
                        <div
                          key={ingredient.id}
                          className={`product-modal__ingredient${isSelected ? " product-modal__ingredient--selected" : ""}`}
                          onClick={() => toggleIngredient(category, ingredient)}
                        >
                          <div className="product-modal__ingredient-info">
                            <span className="product-modal__ingredient-name">{ingName}</span>
                            {ingredient.additional_price > 0 && (
                              <span className="product-modal__ingredient-price">
                                +{numberDigits(ingredient.additional_price)} {t.sum}
                              </span>
                            )}
                          </div>
                          <div
                            className={`product-modal__${isRadio ? "radio" : "checkbox"}${isSelected ? ` product-modal__${isRadio ? "radio" : "checkbox"}--checked` : ""}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isOnlyMenu && (
          <div className="product-modal__footer">
            {!hasIngredients && cartQuantity > 0 ? (
              <div className="product-modal__counter">
                <button className="product-modal__counter-btn" onClick={onDecrement}>
                  <MinusIcon width={20} height={20} />
                </button>
                <span className="product-modal__counter-qty">{cartQuantity}</span>
                <button className="product-modal__counter-btn" onClick={onIncrement}>
                  <PluseIcon width={20} height={20} />
                </button>
              </div>
            ) : (
              <button className="product-modal__submit" onClick={handleSubmit}>
                {t.addToCart} • {numberDigits(totalPrice)} {t.sum}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
