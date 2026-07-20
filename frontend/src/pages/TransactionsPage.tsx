import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function Transactions() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Transações"
        description="Gerencie todas as suas transações financeiras"
      >
        <Button variant="primary" onClick={() => {}}>
          <Plus className="size-4" />
          Nova transação
        </Button>
      </PageHeader>
    </div>
  );
}
