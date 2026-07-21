import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationToast } from "@/components/ui/notification-toast";
import { ChangePasswordDialog } from "@/components/user/change-password-dialog";
import { useLogout } from "@/hooks/auth/use-logout";
import { useUpdateUser } from "@/hooks/user/use-update-user";
import { getErrorMessage } from "@/lib/helpers/get-error-message";
import { getInitials } from "@/lib/helpers/get-initials";
import { useAuthStore } from "@/stores/auth-store";

const updateUserSchema = z.object({
  name: z.string().min(3, "Nome é obrigatório"),
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateUserInStore = useAuthStore((state) => state.updateUser);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearAuth = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const updateUser = useUpdateUser();
  const logoutMutation = useLogout();

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastDescription, setToastDescription] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  function onSubmit(values: UpdateUserFormValues) {
    updateUser.mutate(values, {
      onSuccess: (data) => {
        updateUserInStore(data.updateUser),
          setToastVariant("success"),
          setToastDescription("Dados atualizados com sucesso."),
          setToastOpen(true);
      },
      onError: (error) => {
        setToastVariant("error"), setToastDescription(getErrorMessage(error)), setToastOpen(true);
      },
    });
  }

  function handleLogout() {
    if (refreshToken) logoutMutation.mutate({ refreshToken });

    clearAuth();
    queryClient.clear();
    navigate("/");
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-1 mb-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-gray-200 text-xl font-semibold text-gray-700">
            {user ? getInitials(user.name) : "?"}
          </div>
          <div className="text-center gap-1">
            <h1 className="text-gray-800 font-bold text-[20px]">{user?.name}</h1>
            <p className="text-[16px] font-normal text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              id="name"
              label="Nome completo"
              icon={UserRound}
              type="text"
              {...register("name")}
              error={errors.name}
            />

            <Input
              id="email"
              label="E-mail"
              icon={Mail}
              type="email"
              value={user?.email ?? ""}
              disabled
              readOnly
              hint="O e-mail não pode ser alterado"
            />

            <Button type="submit" variant="primary" isLoading={updateUser.isPending}>
              {updateUser.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>

          <Button
            type="button"
            variant="link"
            className="mt-3 w-full text-sm"
            onClick={() => setChangePasswordOpen(true)}
          >
            Alterar senha
          </Button>

          <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />

          <Button variant="outline" className="mt-4 w-full" onClick={handleLogout}>
            <LogOut className="size-4 text-danger" />
            Sair da conta
          </Button>
        </div>
      </div>

      <NotificationToast
        open={toastOpen}
        setOpen={setToastOpen}
        variantToast={toastVariant}
        description={toastDescription}
      />
    </div>
  );
}
