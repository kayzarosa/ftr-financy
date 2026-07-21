import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { CategorySelect } from "@/components/category/category-select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NotificationToast } from "@/components/ui/notification-toast";
import { OptionPicker, OptionPickerItem } from "@/components/ui/option-picker";
import { useCreateTransaction } from "@/hooks/transaction/use-create-transaction";
import { useUpdateTransaction } from "@/hooks/transaction/use-update-transaction";
import { getErrorMessage } from "@/lib/helpers/get-error-message";

function fromCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function toCents(value: string) {
  return Number(value.replace(/\D/g, ""));
}

function formatCurrency(raw: string) {
  return fromCents(toCents(raw));
}

const upSertTransactionSchema = z.object({
  name: z.string().min(3, "Descrição é obrigatória"),
  value: z
    .string()
    .min(1, "Informe um valor")
    .refine((v) => Number(v.replace(/\D/g, "")) > 0, "Valor deve ser maior que zero"),
  date: z.string().min(1, "Selecione uma data"),
  categoryId: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE"]),
});

type UpSertTransactionFormValues = z.infer<typeof upSertTransactionSchema>;

type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export type Transaction = {
  id: string;
  name: string;
  value: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  category: Category | null;
};

type UpSertTransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
};

export function UpSertTransactionDialog({
  open,
  onOpenChange,
  transaction,
}: UpSertTransactionDialogProps) {
  const [toastOpen, setToastOpen] = useState(false);
  const [toastDescription, setToastDescription] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");

  const { mutate: createTransaction, isPending: createIsPending } = useCreateTransaction();
  const { mutate: updateTransaction, isPending: updateIsPending } = useUpdateTransaction();

  const isSaving = createIsPending || updateIsPending;

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      reset();
    }
  }

  function addTransaction(values: UpSertTransactionFormValues) {
    createTransaction(
      {
        name: values.name,
        type: values.type,
        value: toCents(values.value),
        categoryId: values.categoryId || undefined,
        date: values.date,
      },
      {
        onSuccess: () => {
          setToastVariant("success");
          setToastDescription("Transação criada com sucesso.");
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

  function transactionUpdate(values: UpSertTransactionFormValues) {
    if (!transaction) {
      return;
    }

    updateTransaction(
      {
        id: transaction.id,
        name: values.name,
        type: values.type,
        value: toCents(values.value),
        categoryId: values.categoryId || undefined,
        date: values.date,
      },
      {
        onSuccess: () => {
          setToastVariant("success");
          setToastDescription("Transação alterada com sucesso.");
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

  function onSubmit(values: UpSertTransactionFormValues) {
    if (!transaction) {
      addTransaction(values);
    } else {
      transactionUpdate(values);
    }
  }

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpSertTransactionFormValues>({
    resolver: zodResolver(upSertTransactionSchema),
    defaultValues: {
      name: transaction?.name ?? "",
      value: transaction ? fromCents(transaction.value) : "",
      date: transaction ? transaction.date.slice(0, 10) : "",
      categoryId: transaction?.category?.id ?? "",
      type: transaction?.type ?? "EXPENSE",
    },
  });

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-110.5">
          <DialogTitle className="text-[16px] font-semibold text-gray-800">
            {transaction ? "Alterar transação" : "Nova transação"}
          </DialogTitle>
          <DialogDescription className="text-[14px] text-gray-600">
            Registre sua despesa ou receita
          </DialogDescription>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="border border-gray-200 rounded-lg p-2">
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <OptionPicker label="" value={field.value} onValueChange={field.onChange}>
                    <OptionPickerItem
                      value="EXPENSE"
                      label="Despesa"
                      className="group flex-1 gap-2 py-3 border-transparent data-unchecked:hover:border-transparent data-checked:border-danger"
                    >
                      <ArrowDownCircle className="size-4 text-gray-500 group-data-checked:text-danger" />
                      Despesa
                    </OptionPickerItem>

                    <OptionPickerItem
                      value="INCOME"
                      label="Receita"
                      className="group flex-1 gap-2 py-3 border-transparent data-unchecked:hover:border-transparent data-checked:border-success"
                    >
                      <ArrowUpCircle className="size-4 text-gray-500 group-data-checked:text-success" />
                      Receita
                    </OptionPickerItem>
                  </OptionPicker>
                )}
              />
            </div>

            <Input
              id="name"
              label="Descrição"
              type="text"
              placeholder="Ex. Almoço no restaurante"
              error={errors.name}
              {...register("name")}
            />

            <div className="flex flex-col gap-4 sm:flex-row">
              <Input
                id="date"
                label="Data"
                type="date"
                placeholder="Selecione"
                error={errors.date}
                {...register("date")}
              />

              <Controller
                control={control}
                name="value"
                render={({ field }) => (
                  <Input
                    id="value"
                    label="Valor"
                    inputMode="decimal"
                    placeholder="R$ 0,00"
                    error={errors.value}
                    {...field}
                    onChange={(event) => field.onChange(formatCurrency(event.target.value))}
                  />
                )}
              />
            </div>

            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <CategorySelect
                  label="Categoria"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  placeholder="Selecione"
                />
              )}
            />

            <Button type="submit" variant="primary" isLoading={isSaving} className="mt-2">
              {isSaving ? "Salvando..." : "Salvar"}
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
