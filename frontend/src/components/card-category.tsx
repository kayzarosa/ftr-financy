import { type LucideIcon, SquarePen, Trash } from "lucide-react";
import { IconButton } from "./ui/icon-button";

type Category = {
  transactionsCount: number;
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
};

type CardCategoryProps = {
  key: string;
  icon: LucideIcon;
  category: Category;
  deleteCategory: (id: string) => void;
  editCategory: (category: Category) => void;
};

export function CardCategory({
  key,
  icon: Icon,
  category,
  deleteCategory,
  editCategory,
}: CardCategoryProps) {
  return (
    <article
      key={key}
      className="flex flex-col p-6 bg-white border border-gray-200 rounded-xl w-full sm:w-71 h-56.5"
    >
      <div className="flex justify-between w-full">
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `color-mix(in srgb, ${category.color} 15%, white)`,
          }}
        >
          <Icon className="size-4" color={category.color} />
        </div>

        <div className="flex gap-2 top-0">
          <IconButton
            aria-label="Excluir categoria"
            onClick={() => deleteCategory(category.id)}
          >
            <Trash className="size-4 text-danger" />
          </IconButton>

          <IconButton
            aria-label="Alterar categoria"
            onClick={() => editCategory(category)}
          >
            <SquarePen className="size-4 text-gray-700" />
          </IconButton>
        </div>
      </div>

      <h3 className="text-[16px] text-gray-800 font-semibold mt-6">{category.name}</h3>

      <p className="text-[14px] text-gray-600">{category.description}</p>

      <div className="flex w-full justify-between mt-auto">
        <div
          className="rounded-full font-medium text-[14px] pt-1 pb-1 pr-3 pl-3"
          style={{
            backgroundColor: `color-mix(in srgb, ${category.color} 15%, white)`,
            color: `${category.color}`,
          }}
        >
          {category.name}
        </div>

        <p className="font-medium text-[14px] text-gray-600">{category.transactionsCount} itens</p>
      </div>
    </article>
  );
}
