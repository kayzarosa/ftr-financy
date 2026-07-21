export const transactionGridColumns =
  "grid-cols-[minmax(0,1fr)_100px_150px_90px_120px_120px]";

export function TransactionsHeader() {
  return (
    <div
      className={`hidden md:grid ${transactionGridColumns} items-center
        gap-4 px-6 py-4 text-[12px] uppercase tracking-wide text-gray-500 font-medium
        border border-gray-200 rounded-t-xl bg-white`}
    >
      <span>Descrição</span>
      <span className="text-center">Data</span>
      <span className="text-center">Categoria</span>
      <span className="text-center">Tipo</span>
      <span className="text-right">Valor</span>
      <span className="text-right">Ações</span>
    </div>
  );
}
