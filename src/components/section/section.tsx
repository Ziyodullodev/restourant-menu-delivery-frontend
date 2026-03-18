import { Card } from "../card/card";
import { IApiCategory } from "@/types/api.types";
import { useI18n } from "@/contexts/i18n-context";
import { useMenu } from "@/contexts/menu-context";
import "./section.scss";

interface IProps {
  category: IApiCategory;
}

export function Section(props: IProps): React.ReactElement {
  const { category } = props;
  const { language } = useI18n();
  const { getProductsByCategory } = useMenu();

  const products = getProductsByCategory(category.id);
  const title = language === "uz" ? category.name_uz : category.name_ru;

  return (
    <div id={category.id} className="section">
      <h3 className="section__title">
        {category.image && (
          <img
            src={category.image}
            alt={title}
            style={{
              width: 24,
              height: 24,
              borderRadius: "4px",
              verticalAlign: "middle",
              marginRight: 8,
            }}
          />
        )}
        {title}
      </h3>

      <div className="section__items">
        {products.length > 0 ? (
          products.map((product) => <Card key={product.id} product={product} />)
        ) : (
          <p className="section__empty">Mahsulotlar topilmadi</p>
        )}
      </div>
    </div>
  );
}
