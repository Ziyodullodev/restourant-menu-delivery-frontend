import { Card } from "../card/card";
import { ICategory } from "../mock/mock";
import { useI18n } from "@/contexts/i18n-context";
import "./section.scss";

interface IProps {
  category: ICategory;
}

export function Section(props: IProps): React.ReactElement {
  const { category } = props;
  const { language } = useI18n();

  return (
    <div id={category.id} className="section">
      <h3 className="section__title">
        {category.icon} {category.title[language as "ru" | "uz"]}
      </h3>

      <div className="section__items">
        {category.products.map((product) => (
          <Card key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
