import { FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type CategoryEmptyProps = {
  openCreateCategory: () => void;
};

export function CategoriesEmptyState({
  openCreateCategory,
}: CategoryEmptyProps) {
  return (
    <div className="flex min-h-50 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 p-8 text-center">
      <FolderOpen className="size-8 text-gray-400" />

      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-gray-800">
          Crie sua primeira categoria
        </h2>
        <p className="max-w-sm text-sm text-gray-500">
          Categorias agrupam suas transações e mostram para onde seu dinheiro
          está indo.
        </p>
      </div>

      <Button
        variant="primary"
        size="sm"
        className="mt-1"
        onClick={openCreateCategory}
      >
        <Plus className="size-4" />
        Nova categoria
      </Button>
    </div>
  );
}
