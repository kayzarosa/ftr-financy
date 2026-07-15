import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

export const buttonVariants = tv({
  base: "inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:pointer-events-none",

  variants: {
    variant: {
      primary: "text-white bg-brand-base hover:bg-brand-dark",
      secondary: "text-gray-800 bg-gray-100 hover:bg-gray-200",
      outline: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100",
      destructive: "text-white bg-danger hover:bg-danger/90",
    },
    size: {
      default: "h-12 px-4 text-sm",
      sm: "h-8 px-3 text-xs",
      icon: "size-9",
    },
  },

  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
  };

export function Button({
  variant,
  size,
  className,
  asChild,
  isLoading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || isLoading}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          {children}
        </>
      )}
    </Component>
  );
}
