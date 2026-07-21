import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoriesList } from "@/hooks/use-categories-list";
import { getCategoryIcon } from "@/lib/category-icons";

type CategorySelectProps = {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  includeAll?: boolean;
  placeholder?: string;
};

export function CategorySelect({
  label,
  value,
  onValueChange,
  includeAll,
  placeholder,
}: CategorySelectProps) {
  const { data } = useCategoriesList();
  const categories = data?.categories ?? [];

  const items = {
    ...(includeAll && { all: "Todas" }),
    ...Object.fromEntries(categories.map((category) => [category.id, category.name] as const)),
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <span className="text-[14px] font-medium text-gray-700">{label}</span>

      <Select items={items} value={value} onValueChange={(next) => onValueChange(next as string)}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {includeAll && <SelectItem value="all">Todas</SelectItem>}

          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon);
            return (
              <SelectItem key={category.id} value={category.id}>
                <span className="flex items-center gap-2">
                  <Icon className="size-4" style={{ color: category.color }} />
                  {category.name}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
