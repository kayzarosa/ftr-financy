import { ArrowUpDown, CircleDashed, Plus, Tag } from "lucide-react";
import { useState } from "react";
import { CardCategory } from "@/components/card-category";
import { CategoriesEmptyState } from "@/components/categories-empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { CardInfo } from "@/components/ui/card-info";
import { NotificationToast } from "@/components/ui/notification-toast";
import {
  type Category,
  UpSertCategoryDialog,
} from "@/components/upsert-category-dialog";
import { useCategoriesCountTransactions } from "@/hooks/use-categories-count-transaction";
import { useDeleteCategory } from "@/hooks/use-delete-category";
import { getCategoryIcon } from "@/lib/category-icons";
import { getErrorMessage } from "@/lib/get-error-message";

export function CategoriesPage() {
  const {
    data: categories,
    isLoading,
    error,
  } = useCategoriesCountTransactions();
  const { mutate: removeCategory } = useDeleteCategory();
  const [upsetCategoryOpen, setUpsetCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [idCategoryDelete, setIdCategoryDelete] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastDescription, setToastDescription] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error">(
    "success",
  );

  function handleUpsertOpenChange(open: boolean) {
    setUpsetCategoryOpen(open);
    if (!open) setEditingCategory(null);
  }

  const totalTransactions =
    categories?.reduce((sum, c) => sum + c.transactionsCount, 0) ?? 0;

  const mostUsedCategory =
    totalTransactions === 0
      ? null
      : categories?.reduce((most, c) =>
          c.transactionsCount > most.transactionsCount ? c : most,
        );

  const MostUsedIcon = !mostUsedCategory
    ? CircleDashed
    : getCategoryIcon(mostUsedCategory.icon);

  function openCreateCategory() {
    setEditingCategory(null);
    setUpsetCategoryOpen(true);
  }

  function openDialogConfirmDelete(id: string) {
    setIdCategoryDelete(id);
    setConfirmDialogOpen(true);
  }

  function openUpdateCategory(category: Category) {
    setEditingCategory(category);
    setUpsetCategoryOpen(true);
  }

  function handleDelete() {
    removeCategory(
      { id: idCategoryDelete },
      {
        onSuccess: () => {
          setToastVariant("success");
          setToastDescription("Categoria excluída com sucesso.");
          setToastOpen(true);
          setConfirmDialogOpen(false);
        },
        onError: (error) => {
          setToastVariant("error");
          setToastDescription(getErrorMessage(error));
          setToastOpen(true);
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Categorias"
        description="Organize suas transações por categorias"
      >
        <Button variant="primary" onClick={openCreateCategory}>
          <Plus className="size-4" />
          Nova Categoria
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <CardInfo
          classIcon="text-gray-700"
          icon={Tag}
          label="Total de categorias"
          value={categories?.length ?? 0}
        />

        <CardInfo
          classIcon="text-purple-base"
          icon={ArrowUpDown}
          label="Total de transações"
          value={totalTransactions}
        />

        <CardInfo
          classIcon={mostUsedCategory ? "text-gray-700" : "text-gray-400"}
          iconColor={mostUsedCategory?.color ?? undefined}
          icon={MostUsedIcon}
          label="Categoria mais utilizada"
          value={
            mostUsedCategory?.name ?? (
              <>
                <span aria-hidden="true">&mdash;</span>
                <span className="sr-only">Nenhuma ainda</span>
              </>
            )
          }
        />
      </div>

      {!isLoading && categories?.length === 0 && (
        <CategoriesEmptyState openCreateCategory={openCreateCategory} />
      )}

      {error && (
        <p className="text-danger">
          Não foi possível carregar as categorias. Tente novamente.
        </p>
      )}

      <section className="flex flex-wrap gap-4">
        {categories &&
          categories.length > 0 &&
          categories.map((c) => {
            const Icon = getCategoryIcon(c.icon);
            return (
              <CardCategory
                key={c.id}
                icon={Icon}
                category={c}
                deleteCategory={openDialogConfirmDelete}
                editCategory={openUpdateCategory}
              />
            );
          })}
      </section>

      <UpSertCategoryDialog
        key={editingCategory?.id ?? "new"}
        open={upsetCategoryOpen}
        onOpenChange={handleUpsertOpenChange}
        category={editingCategory}
      />

      <ConfirmDialog
        title="Deletar Categoria"
        description="Deseja realmente deletar essa categoria?"
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleDelete}
      />

      <NotificationToast
        open={toastOpen}
        setOpen={setToastOpen}
        variantToast={toastVariant}
        description={toastDescription}
      />
    </div>
  );
}
