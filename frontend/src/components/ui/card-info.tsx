import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/helpers/utils";

type CardInfoProps = {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  classIcon?: string;
  iconColor?: string;
  model?: "Category" | "Dashboard";
};

export function CardInfo({
  label,
  value,
  classIcon,
  iconColor,
  icon: Icon,
  model = "Category",
}: CardInfoProps) {
  return (
    <div className="flex flex-1 items-start p-6 bg-white rounded-xl border border-gray-200 gap-4">
      {model === "Category" ? (
        <>
          <Icon className={cn("size-6", classIcon)} color={iconColor} />
          <dl className="flex flex-col-reverse gap-2">
            <dt className="uppercase text-xs font-medium text-gray-500">
              {label}
            </dt>
            <dd className="text-[28px] leading-none text-gray-800 font-bold">
              {value}
            </dd>
          </dl>
        </>
      ) : (
        <dl className="flex flex-col gap-4">
          <dt className="flex flex-row gap-3 uppercase text-xs font-medium text-gray-500">
            <Icon className={cn("size-5", classIcon)} color={iconColor} />
            {label}
          </dt>
          <dd className="text-[28px] leading-none text-gray-800 font-bold">
            {value}
          </dd>
        </dl>
      )}
    </div>
  );
}
