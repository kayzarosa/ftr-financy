import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { useCreateCategory } from "@/hooks/use-create-categories";
import { useUpdateCategory } from "@/hooks/use-update-categories";
import { categoryColors, DEFAULT_CATEGORY_COLOR } from "@/lib/category-colors";
import { categoryIconNames, getCategoryIcon } from "@/lib/category-icons";
import { getErrorMessage } from "@/lib/get-error-message";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { NotificationToast } from "./ui/notification-toast";
import { OptionPicker, OptionPickerItem } from "./ui/option-picker";

const upSertCategorySchema = z.object({
  name: z.string().min(3, "Título da categoria não informado"),
  description: z.string(),
  color: z.string().min(1, "Escolha uma cor"),
  icon: z.string().min(1, "Escolha um ícone"),
});

type UpSertCategoryFormValues = z.infer<typeof upSertCategorySchema>;

export type Category = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
};

type UpSertCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
};

export function UpSertCategoryDialog({ open, onOpenChange, category }: UpSertCategoryDialogProps) {
  const [toastOpen, setToastOpen] = useState(false);
  const [toastDescription, setToastDescription] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");
  const { mutate: createCategory, isPending: categoryIsPending } = useCreateCategory();
  const { mutate: updateCategory } = useUpdateCategory();

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      reset();
    }
  }

  function addCategory(values: UpSertCategoryFormValues) {
    createCategory(
      {
        name: values.name,
        description: values.description,
        icon: values.icon,
        color: values.color,
      },
      {
        onSuccess: () => {
          setToastVariant("success");
          setToastDescription("Categoria criada com sucesso.");
          setToastOpen(true);
          handleOpenChange(false);
        },
        onError: (error) => {
          setToastVariant("error");
          setToastDescription(getErrorMessage(error));
          setToastOpen(true);
        },
      },
    );
  }

  function categoryUpdate(values: UpSertCategoryFormValues) {
    if (!category) {
      return;
    }

    updateCategory(
      {
        id: category.id,
        name: values.name,
        description: values.description,
        icon: values.icon,
        color: values.color,
      },
      {
        onSuccess: () => {
          setToastVariant("success");
          setToastDescription("Categoria alterada com sucesso.");
          setToastOpen(true);
          handleOpenChange(false);
        },
        onError: (error) => {
          setToastVariant("error");
          setToastDescription(getErrorMessage(error));
          setToastOpen(true);
        },
      },
    );
  }

  function onSubmit(values: UpSertCategoryFormValues) {
    if (!category) {
      addCategory(values);
    } else {
      categoryUpdate(values);
    }
  }

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpSertCategoryFormValues>({
    resolver: zodResolver(upSertCategorySchema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
      color: category?.color ?? DEFAULT_CATEGORY_COLOR,
      icon: category?.icon ?? categoryIconNames[0],
    },
  });

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-110.5">
          <DialogTitle className="text-[16px] font-semibold text-gray-800">
            {category ? "Alterar categoria" : "Nova categoria"}
          </DialogTitle>
          <DialogDescription className="text-[14px] text-gray-600">
            Organize suas transações com categorias
          </DialogDescription>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="name"
              label="Título"
              type="text"
              placeholder="Ex. Alimentação"
              error={errors.name}
              {...register("name")}
            />

            <Input
              id="description"
              label="Descrição"
              type="text"
              placeholder="Descrição da categoria"
              hint="Opcional"
              error={errors.description}
              {...register("description")}
            />

            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <OptionPicker label="Ícone" value={field.value} onValueChange={field.onChange}>
                  {categoryIconNames.map((name) => {
                    const Icon = getCategoryIcon(name);
                    return (
                      <OptionPickerItem className="size-10.5" key={name} value={name} label={name}>
                        <Icon className="size-5 text-gray-600" />
                      </OptionPickerItem>
                    );
                  })}
                </OptionPicker>
              )}
            />

            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <OptionPicker label="Cor" value={field.value} onValueChange={field.onChange}>
                  {categoryColors.map(({ value, label }) => (
                    <OptionPickerItem
                      className="h-7.5 flex-1 p-1"
                      key={value}
                      value={value}
                      label={label}
                    >
                      <span className="size-full rounded" style={{ backgroundColor: value }} />
                    </OptionPickerItem>
                  ))}
                </OptionPicker>
              )}
            />

            <Button type="submit" variant="primary" isLoading={categoryIsPending} className="mt-2">
              {categoryIsPending ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <NotificationToast
        open={toastOpen}
        setOpen={setToastOpen}
        variantToast={toastVariant}
        description={toastDescription}
      />
    </>
  );
}
