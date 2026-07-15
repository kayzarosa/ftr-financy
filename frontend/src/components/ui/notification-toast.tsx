import * as Toast from "@radix-ui/react-toast";
import { Ban, Check, Info, X } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const toastRootVariants = tv({
  base: "relative mt-14 flex w-80 gap-3 overflow-hidden rounded-2xl border border-gray-200 border-l-4 bg-white p-4 shadow-lg md:mt-3 data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-right-full data-[swipe=end]:animate-out",
  variants: {
    variantToast: {
      success: "border-l-success",
      error: "border-l-danger",
      info: "border-l-gray-400",
    },
  },
  defaultVariants: {
    variantToast: "info",
  },
});

const iconBadgeVariants = tv({
  base: "flex size-7 shrink-0 items-center justify-center rounded-full",
  variants: {
    variantToast: {
      success: "bg-success/10 text-success",
      error: "bg-danger/10 text-danger",
      info: "bg-gray-100 text-gray-600",
    },
  },
  defaultVariants: {
    variantToast: "info",
  },
});

const titleVariants = tv({
  base: "text-sm font-bold",
  variants: {
    variantToast: {
      success: "text-success",
      error: "text-danger",
      info: "text-gray-700",
    },
  },
  defaultVariants: {
    variantToast: "info",
  },
});

type NotificationToastProps = ComponentPropsWithoutRef<typeof Toast.Root> &
  VariantProps<typeof toastRootVariants> & {
    description?: string;
    open: boolean;
    setOpen: (open: boolean) => void;
  };

export function NotificationToast({
  description,
  open,
  setOpen,
  variantToast,
  className,
}: NotificationToastProps) {
  return (
    <Toast.Root
      className={toastRootVariants({ variantToast, className })}
      open={open}
      onOpenChange={setOpen}
    >
      <div className={iconBadgeVariants({ variantToast })}>
        {variantToast === "success" ? (
          <Check size={14} />
        ) : variantToast === "error" ? (
          <Ban size={14} />
        ) : (
          <Info size={14} />
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <Toast.Title className={titleVariants({ variantToast })}>
          {variantToast === "success" ? "Sucesso" : variantToast === "error" ? "Erro" : "Info"}
        </Toast.Title>

        {description && (
          <Toast.Description className="text-xs text-gray-600">{description}</Toast.Description>
        )}
      </div>

      <Toast.Close className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
        <X size={16} />
      </Toast.Close>
    </Toast.Root>
  );
}
