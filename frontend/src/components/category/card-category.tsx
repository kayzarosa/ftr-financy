import { type LucideIcon, SquarePen, Trash } from "lucide-react";
import { IconCategory } from "@/components/category/icon-category";
import { TagCategory } from "@/components/category/tag-category";
import { IconButton } from "@/components/ui/icon-button";

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
  icon,
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
        <IconCategory color={category.color} icon={icon} />

        <div className="flex gap-2 top-0">
          <IconButton aria-label="Excluir categoria" onClick={() => deleteCategory(category.id)}>
            <Trash className="size-4 text-danger" />
          </IconButton>

          <IconButton aria-label="Alterar categoria" onClick={() => editCategory(category)}>
            <SquarePen className="size-4 text-gray-700" />
          </IconButton>
        </div>
      </div>

      <h3 className="text-[16px] text-gray-800 font-semibold mt-6">{category.name}</h3>

      <p className="text-[14px] text-gray-600">{category.description}</p>

      <div className="flex w-full justify-between mt-auto">
        <TagCategory color={category.color} name={category.name} />

        <p className="font-medium text-[14px] text-gray-600">{category.transactionsCount} itens</p>
      </div>
    </article>
  );
}
