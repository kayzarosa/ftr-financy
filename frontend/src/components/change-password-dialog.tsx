import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NotificationToast } from "@/components/ui/notification-toast";
import { useUpdatePassword } from "@/hooks/use-update-password";
import { getErrorMessage } from "@/lib/get-error-message";

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: z
      .string()
      .min(8, "Nova senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const [toastOpen, setToastOpen] = useState(false);
  const [toastDescription, setToastDescription] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error">(
    "success",
  );

  const { mutate: updatePassword, isPending: updateIsPending } =
    useUpdatePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      reset();
    }
  }

  function onSubmit(values: ChangePasswordFormValues) {
    updatePassword(
      { oldPassword: values.oldPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          setToastVariant("success");
          setToastDescription("Senha alterada com sucesso.");
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

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogTitle className="mb-4 text-lg font-bold text-gray-800">
            Alterar senha
          </DialogTitle>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              id="oldPassword"
              label="Senha atual"
              icon={Lock}
              type="password"
              placeholder="Digite sua senha atual"
              error={errors.oldPassword}
              {...register("oldPassword")}
            />

            <Input
              id="newPassword"
              label="Nova senha"
              icon={Lock}
              type="password"
              placeholder="Digite a nova senha"
              hint="A senha deve ter no mínimo 8 caracteres"
              error={errors.newPassword}
              {...register("newPassword")}
            />

            <Input
              id="confirmPassword"
              label="Confirmar nova senha"
              icon={Lock}
              type="password"
              placeholder="Repita a nova senha"
              error={errors.confirmPassword}
              {...register("confirmPassword")}
            />

            <Button type="submit" variant="primary" isLoading={updateIsPending}>
              {updateIsPending ? "Salvando..." : "Salvar nova senha"}
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
