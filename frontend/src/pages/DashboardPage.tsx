import { IconCategory } from "@/components/category/icon-category";
import { TagCategory } from "@/components/category/tag-category";
import { UpSertTransactionDialog } from "@/components/transaction/upsert-transaction-dialog";
import { Button } from "@/components/ui/button";
import { CardInfo } from "@/components/ui/card-info";
import { useCategorySpending } from "@/hooks/category/use-category-spending";
import { useRecentTransactions } from "@/hooks/transaction/use-recent-transactions";
import { useTransactionSummary } from "@/hooks/transaction/use-transaction-summary";
import { getCategoryIcon } from "@/lib/constants/category-icons";
import { formatCurrency } from "@/lib/format/format-currency";
import { formatDate } from "@/lib/format/format-date";
import { getPeriodOptions } from "@/lib/format/get-period";
import {
  ChevronRight,
  CircleArrowDown,
  CircleArrowUp,
  Plus,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function DashboardPage() {
  const [openNewTransaction, setOpenNewTransaction] = useState(false);
  const { data: transactions } = useRecentTransactions();
  const month = getPeriodOptions()[0].value;
  const { data: summary } = useTransactionSummary(month);
  const summaryData = summary?.transactionSummary;

  const { data: spending } = useCategorySpending(month);
  const categories = spending?.categorySpending ?? [];

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <CardInfo
            label="Saldo total"
            icon={Wallet}
            classIcon="text-purple-base"
            value={formatCurrency(summaryData?.balance ?? 0)}
            model="Dashboard"
          />

          <CardInfo
            label="Receitas do mês"
            icon={CircleArrowUp}
            classIcon="text-brand-base"
            value={formatCurrency(summaryData?.income ?? 0)}
            model="Dashboard"
          />

          <CardInfo
            label="Despesas do mês"
            icon={CircleArrowDown}
            classIcon="text-red-base"
            value={formatCurrency(summaryData?.expense ?? 0)}
            model="Dashboard"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between border-b border-gray-200 pt-5.5 pb-5.5 pl-6 pr-3">
              <h4 className="text-xs text-gray-500 uppercase font-medium">
                Transações recentes
              </h4>

              <Button asChild variant="link">
                <Link to={"/transacoes"}>
                  Ver todas
                  <ChevronRight className="size-5" />
                </Link>
              </Button>
            </div>

            {transactions?.transactions &&
              transactions.transactions.total > 0 &&
              transactions.transactions.items.map((transaction) => {
                const Icon = getCategoryIcon(transaction.category?.icon);
                const formattedValue = `${transaction.type === "INCOME" ? "+ " : "- "}${formatCurrency(transaction.value)}`;

                const tag = transaction.category?.color ? (
                  <TagCategory
                    color={transaction.category.color}
                    name={transaction.category.name}
                  />
                ) : (
                  "—"
                );

                return (
                  <div
                    key={transaction.id}
                    className="grid grid-cols-[1fr_auto] md:grid-cols-[minmax(0,1fr)_150px_150px] items-center gap-3 md:gap-4 py-4 md:py-5 px-4 md:px-6 border-b border-b-gray-200"
                  >
                    <div className="flex gap-3 md:gap-4 items-center min-w-0">
                      <IconCategory
                        color={transaction.category?.color}
                        icon={Icon}
                      />

                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-[16px] text-gray-800 font-medium">
                          {transaction.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] text-gray-600">
                            {formatDate(transaction.date)}
                          </span>
                          <span className="md:hidden">{tag}</span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:flex justify-center">{tag}</div>

                    <div className="flex flex-row items-center gap-2 justify-end whitespace-nowrap">
                      {formattedValue}
                      {transaction.type === "EXPENSE" ? (
                        <CircleArrowDown className="size-4 text-red-base" />
                      ) : (
                        <CircleArrowUp className="size-4 text-brand-base" />
                      )}
                    </div>
                  </div>
                );
              })}

            <div className="flex justify-center items-center p-5">
              <Button
                variant="link"
                onClick={() => setOpenNewTransaction(true)}
              >
                <Plus className="size-5 text-brand-base" />
                Nova transação
              </Button>
            </div>
          </section>
          <section className="lg:col-span-1 self-start bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between border-b border-gray-200 pt-5.5 pb-5.5 pl-6 pr-3">
              <h4 className="text-xs text-gray-500 uppercase font-medium">
                Categorias
              </h4>

              <Button asChild variant="link">
                <Link to={"/categorias"}>
                  Gerenciar
                  <ChevronRight className="size-5" />
                </Link>
              </Button>
            </div>
            {categories.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 py-4 px-6 border-b border-gray-100"
              >
                <TagCategory color={c.color} name={c.name} />
                <span className="text-sm text-gray-500">{c.count} itens</span>
                <span className="font-bold text-gray-800 text-right">
                  {formatCurrency(c.total)}
                </span>
              </div>
            ))}
          </section>
        </div>
      </div>

      <UpSertTransactionDialog
        open={openNewTransaction}
        onOpenChange={setOpenNewTransaction}
      />
    </>
  );
}
