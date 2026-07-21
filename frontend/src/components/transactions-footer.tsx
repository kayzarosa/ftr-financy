import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { IconButton } from "./ui/icon-button";

type TransactionsFooterProps = {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function TransactionsFooter({ page, limit, total, onPageChange }: TransactionsFooterProps) {
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between rounded-b-xl border border-gray-200 border-t-0 bg-white px-6 py-4 text-[14px]">
      <span className="text-gray-500">
        {from} a {to} <span className="text-gray-300">|</span> {total} resultados
      </span>

      <div className="flex items-center gap-1">
        <IconButton
          aria-label="Página anterior"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="size-4" />
        </IconButton>

        {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={pageNumber === page ? "primary" : "outline"}
            size="icon"
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}

        <IconButton
          aria-label="Próxima página"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
        >
          <ChevronRight className="size-4" />
        </IconButton>
      </div>
    </div>
  );
}
