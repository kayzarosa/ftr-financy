import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SelectFieldOption<T extends string> = {
  value: T;
  label: string;
};

type SelectFieldProps<T extends string> = {
  label: string;
  options: SelectFieldOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  placeholder?: string;
  className?: string;
};

export function SelectField<T extends string>({
  label,
  options,
  value,
  onValueChange,
  placeholder,
  className,
}: SelectFieldProps<T>) {
  const items = Object.fromEntries(options.map((option) => [option.value, option.label] as const));

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <span className="text-[14px] font-medium text-gray-700">{label}</span>

      <Select items={items} value={value} onValueChange={(next) => onValueChange(next as T)}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
