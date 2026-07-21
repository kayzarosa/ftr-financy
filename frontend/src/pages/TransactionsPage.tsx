import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { CategorySelect } from "@/components/category/category-select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { TransactionsBody } from "@/components/transaction/transactions-body";
import { TransactionsEmptyState } from "@/components/transaction/transactions-empty-state";
import { TransactionsFooter } from "@/components/transaction/transactions-footer";
import { TransactionsHeader } from "@/components/transaction/transactions-header";
import {
  type Transaction,
  UpSertTransactionDialog,
} from "@/components/transaction/upsert-transaction-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationToast } from "@/components/ui/notification-toast";
import { SelectField } from "@/components/ui/select-field";
import { useDeleteTransaction } from "@/hooks/transaction/use-delete-transaction";
import { useTransactions } from "@/hooks/transaction/use-transactions";
import { useTransactionsCount } from "@/hooks/transaction/use-transactions-count";
import { getPeriodOptions } from "@/lib/format/get-period";
import { getErrorMessage } from "@/lib/helpers/get-error-message";

export function Transactions() {
  type TransactionFilter = "all" | "INCOME" | "EXPENSE";

  const typeOptions: { value: TransactionFilter; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "INCOME", label: "Entrada" },
    { value: "EXPENSE", label: "Saída" },
  ];
  const [type, setType] = useState<TransactionFilter>("all");

  const [categoryId, setCategoryId] = useState("all");

  const monthOptions = getPeriodOptions();
  const [period, setPeriod] = useState(monthOptions[0].value);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [openUpsetTransaction, setOpenUpsetTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastDescription, setToastDescription] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");
  const { mutate: removeTransaction } = useDeleteTransaction();

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const { data: transactionsCount } = useTransactionsCount();
  const total = transactionsCount?.transactions.total ?? 0;

  const { data: transactionsData } = useTransactions({
    page,
    type,
    categoryId,
    search,
    month: period,
  });
  const items = transactionsData?.transactions.items ?? [];
  const filteredTotal = transactionsData?.transactions.total ?? 0;

  useEffect(() => {
    setPage(1);
  }, [type, categoryId, period, search]);

  function openDialogConfirmDelete(id: string) {
    setDeleteTransactionId(id);
    setConfirmDialogOpen(true);
  }

  function handleDelete() {
    removeTransaction(
      { id: deleteTransactionId },
      {
        onSuccess: () => {
          setToastVariant("success");
          setToastDescription("Transação excluída com sucesso.");
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
    <>
      <div className="flex flex-col gap-8">
        <PageHeader title="Transações" description="Gerencie todas as suas transações financeiras">
          <Button
            variant="primary"
            onClick={() => {
              setEditingTransaction(null);
              setOpenUpsetTransaction(true);
            }}
          >
            <Plus className="size-4" />
            Nova transação
          </Button>
        </PageHeader>

        <div className="pt-5 pr-6 pl-6 pb-6 bg-white rounded-xl border border-gray-200">
          <div className="flex md:flex-row flex-col md:flex-1 gap-4">
            <Input
              type="text"
              id="search"
              name="search"
              placeholder="Buscar por descrição"
              label="Buscar"
              icon={Search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <SelectField label="Tipo" value={type} onValueChange={setType} options={typeOptions} />

            <CategorySelect
              label="Categoria"
              value={categoryId}
              onValueChange={setCategoryId}
              includeAll
            />

            <SelectField
              label="Período"
              value={period}
              onValueChange={setPeriod}
              options={monthOptions}
            />
          </div>
        </div>

        <div>
          {total <= 0 ? (
            <TransactionsEmptyState openCreateTransaction={() => setOpenUpsetTransaction(true)} />
          ) : (
            <>
              <TransactionsHeader />

              {items.map((transaction) => (
                <TransactionsBody
                  onUpdate={() => {
                    setEditingTransaction(transaction);
                    setOpenUpsetTransaction(true);
                  }}
                  onDelete={() => {
                    openDialogConfirmDelete(transaction.id);
                  }}
                  key={transaction.id}
                  id={transaction.id}
                  date={transaction.date}
                  name={transaction.name}
                  type={transaction.type}
                  value={transaction.value}
                  color={transaction.category?.color}
                  icon={transaction.category?.icon}
                  nameCategory={transaction.category?.name}
                />
              ))}

              <TransactionsFooter
                page={page}
                limit={10}
                total={filteredTotal}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>

      <UpSertTransactionDialog
        key={editingTransaction?.id ?? "new"}
        open={openUpsetTransaction}
        onOpenChange={(open) => {
          setOpenUpsetTransaction(open);
          if (!open) {
            setEditingTransaction(null);
          }
        }}
        transaction={editingTransaction}
      />

      <ConfirmDialog
        title="Deletar Transação"
        description="Deseja realmente deletar essa transação?"
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
    </>
  );
}
