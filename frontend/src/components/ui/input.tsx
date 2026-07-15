import { Eye, EyeClosed, type LucideIcon } from "lucide-react";
import { type ComponentPropsWithRef, useState } from "react";
import type { FieldError } from "react-hook-form";
import { tv } from "tailwind-variants";

const labelStyles = tv({
  base: "font-medium text-[14px]",
  variants: {
    hasError: {
      true: "text-danger",
      false: "text-gray-700 group-focus-within:text-brand-base",
    },
  },
});

const iconStyles = tv({
  base: "transition-colors size-4 mr-3",
  variants: {
    hasError: {
      true: "text-danger",
      false: "text-gray-400 group-focus-within:text-brand-base",
    },
  },
});

type InputProps = ComponentPropsWithRef<"input"> & {
  id: string;
  label: string;
  icon?: LucideIcon;
  error?: FieldError;
  hint?: string;
};

export function Input({ id, label, icon: Icon, error, hint, type, ...props }: InputProps) {
  const hasError = !!error;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="group flex flex-col gap-2 w-full">
      <label htmlFor={id} className={labelStyles({ hasError })}>
        {label}
      </label>

      <div className="flex flex-row items-center pt-3.5 pb-3.5 pl-3 pr-3 border border-gray-300 rounded-lg">
        {Icon && <Icon className={iconStyles({ hasError })} />}

        <input
          id={id}
          type={inputType}
          className="w-full bg-transparent border-none outline-none text-gray-400 placeholder:text-gray-400 text-[16px] placeholder:text-[16px]"
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="mr-3 text-gray-400 bg-transparent border-none cursor-pointer"
          >
            {showPassword ? (
              <Eye className="size-4 text-gray-400" />
            ) : (
              <EyeClosed className="size-4 text-gray-400" />
            )}
          </button>
        )}
      </div>

      {hasError ? (
        <span className="mt-2 text-[12px] text-danger">{error.message}</span>
      ) : (
        hint && <span className="mt-2 text-[12px] text-gray-500">{hint}</span>
      )}
    </div>
  );
}
