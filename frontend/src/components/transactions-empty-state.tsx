import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

type TransactionsEmptyStateProps = {
  openCreateTransaction: () => void;
};

export function TransactionsEmptyState({ openCreateTransaction }: TransactionsEmptyStateProps) {
  return (
    <div className="flex min-h-50 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 p-8 text-center">
      <Receipt className="size-8 text-gray-400" />

      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-gray-800">Nenhuma transação por aqui ainda</h2>
        <p className="max-w-sm text-sm text-gray-500">
          Registre sua primeira entrada ou saída para acompanhar suas finanças.
        </p>
      </div>

      <Button variant="primary" size="sm" className="mt-1" onClick={openCreateTransaction}>
        <Plus className="size-4" />
        Nova transação
      </Button>
    </div>
  );
}
