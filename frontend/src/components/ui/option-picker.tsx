import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type OptionPickerProps<T extends string> = {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  children: ReactNode;
};

export function OptionPicker<T extends string>({
  label,
  value,
  onValueChange,
  className,
  children,
}: OptionPickerProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-[14px] font-medium text-gray-700">{label}</span>}

      <RadioGroup
        value={value}
        onValueChange={(next) => onValueChange(next as T)}
        className={cn("flex flex-wrap gap-2", className)}
      >
        {children}
      </RadioGroup>
    </div>
  );
}

type OptionPickerItemProps = {
  value: string;
  label: string;
  className?: string;
  children: ReactNode;
};

export function OptionPickerItem({ value, label, className, children }: OptionPickerItemProps) {
  return (
    <Radio.Root
      value={value}
      aria-label={label}
      className={cn(
        "flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 transition-colors",
        "data-unchecked:hover:border-gray-300",
        "data-checked:border-brand-base data-checked:bg-gray-100",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-base",
        className,
      )}
    >
      {children}
    </Radio.Root>
  );
}
