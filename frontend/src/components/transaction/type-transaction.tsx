import { CircleArrowDown, CircleArrowUp } from "lucide-react";

type TypeTransactionProps = {
  type: "EXPENSE" | "INCOME";
};

export function TypeTransaction({ type }: TypeTransactionProps) {
  const changeViewType = {
    EXPENSE: {
      icon: CircleArrowDown,
      title: "Saída",
      color: "text-red-dark",
    },
    INCOME: {
      icon: CircleArrowUp,
      title: "Entrada",
      color: "text-green-base",
    },
  } as const;

  const Icon = changeViewType[type].icon;

  return (
    <div
      className={`${changeViewType[type].color} text-[14px] font-medium gap-0.75
      flex items-center
    `}
    >
      <Icon className={`${changeViewType[type].color} size-3.75`} />

      {changeViewType[type].title}
    </div>
  );
}
