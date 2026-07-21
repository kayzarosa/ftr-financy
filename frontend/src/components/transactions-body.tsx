import { getCategoryIcon } from "@/lib/category-icons";
import { IconCategory } from "./icon-category";
import { transactionGridColumns } from "./transactions-header";
import { formatDate } from "@/lib/format-date";
import { TagCategory } from "./tag-category";
import { TypeTransaction } from "./type-transaction";
import { formatCurrency } from "@/lib/format-currency";
import { IconButton } from "./ui/icon-button";
import { SquarePen, Trash } from "lucide-react";

type TransactionBody = {
  id: string;
  name: string;
  date: string;
  value: number;
  type: "EXPENSE" | "INCOME";
  nameCategory?: string;
  color?: string;
  icon?: string;
  onUpdate: () => void;
  onDelete: () => void;
};

export function TransactionsBody({
  id,
  date,
  name,
  type,
  value,
  color,
  icon,
  nameCategory,
  onUpdate,
  onDelete
}: TransactionBody) {
  const Icon = getCategoryIcon(icon);
  const formattedDate = formatDate(date);
  const formattedValue = `${type === "INCOME" ? "+ " : "- "}${formatCurrency(value)}`;

  return (
    <>
      <div
        className={`hidden md:grid ${transactionGridColumns} items-center
                  gap-4 px-6 py-4
                  border-b border-r border-l border-gray-200 bg-white`}
        key={id}
      >
        <span className="font-medium text-[16px] text-gray-800">
          <div className="flex gap-4 items-center">
            <IconCategory color={color} icon={Icon} />

            {name}
          </div>
        </span>
        <span className="text-[14px] text-gray-600 flex justify-center">
          {formattedDate}
        </span>
        <span className="flex justify-center">
          {nameCategory && color ? (
            <TagCategory color={color} name={nameCategory} />
          ) : (
            "—"
          )}
        </span>
        <span className="flex justify-center">
          <TypeTransaction type={type} />
        </span>
        <span className="text-right">{formattedValue}</span>
        <span className="flex justify-end gap-2">
          <IconButton
            aria-label="Excluir transação"
            onClick={() => onDelete()}
          >
            <Trash className="size-4 text-danger" />
          </IconButton>

          <IconButton
            aria-label="Alterar transação"
            onClick={() => onUpdate()}
          >
            <SquarePen className="size-4 text-gray-700" />
          </IconButton>
        </span>
      </div>

      <div className="md:hidden mb-3 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <IconCategory color={color} icon={Icon} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-gray-800">{name}</p>
            <p className="text-[12px] text-gray-500">{formattedDate}</p>
          </div>
          <span className="whitespace-nowrap font-medium text-gray-800">
            {formattedValue}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {nameCategory && color ? (
              <TagCategory color={color} name={nameCategory} />
            ) : (
              "—"
            )}
            <TypeTransaction type={type} />
          </div>
          <div className="flex gap-2">
            <IconButton aria-label="Excluir transação">
              <Trash className="size-4 text-danger" />
            </IconButton>
            <IconButton aria-label="Alterar transação">
              <SquarePen className="size-4 text-gray-700" />
            </IconButton>
          </div>
        </div>
      </div>
    </>
  );
}
