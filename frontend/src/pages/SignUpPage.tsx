import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, LogIn, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import z from "zod";
import logo from "@/assets/logo.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationToast } from "@/components/ui/notification-toast";
import { useSignUp } from "@/hooks/use-sign-up";
import { getErrorMessage } from "@/lib/get-error-message";
import { useAuthStore } from "@/stores/auth-store";

const singUpSchema = z.object({
  name: z.string().min(3, "Nome é obrigtório"),
  email: z.email("E-mail é inválido"),
  password: z.string().min(8, "Senha é obrigatória, mínimo 8 caracteres"),
});

type LoginFormValuesSingUp = z.infer<typeof singUpSchema>;

export function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValuesSingUp>({
    resolver: zodResolver(singUpSchema),
  });

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const signUp = useSignUp();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastDescription, setToastDescription] = useState("");

  function onSubmit(values: LoginFormValuesSingUp) {
    signUp.mutate(values, {
      onSuccess: (data) => {
        setAuth(data.signUp);
        navigate("/");
      },
      onError: (error) => {
        setToastDescription(getErrorMessage(error));
        setToastOpen(true);
      },
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-0 px-4 py-12">
      <div className="mb-8">
        <img src={logo} alt="Financy" className="w-33.5 h-8" />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 text-center gap-1">
          <h1 className="text-gray-800 font-bold text-[20px]">Criar Conta</h1>
          <p className="text-[16px] font-normal text-gray-600">
            Comece a controlar suas finanças ainda hoje
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            id="name"
            label="Nome completo"
            icon={UserRound}
            type="text"
            placeholder="Seu nome completo"
            {...register("name")}
            error={errors.name}
          />

          <Input
            id="email"
            label="E-mail"
            icon={Mail}
            type="email"
            placeholder="mail@exemplo.com"
            {...register("email")}
            error={errors.email}
          />

          <Input
            id="password"
            label="Senha"
            icon={Lock}
            type="password"
            placeholder="Digite seu senha"
            {...register("password")}
            error={errors.password}
            hint="A senha deve ter no mínimo 8 caracteres"
          />

          <Button variant="primary" className="mt-2" isLoading={signUp.isPending}>
            {signUp.isPending ? "Cadastrando" : "Cadastrar"}
          </Button>
        </form>

        <div className="flex items-center gap-3 text-sm text-gray-500 mt-6 mb-6">
          <div className="h-px flex-1 bg-gray-300" />
          ou
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        <p className="text-gray-600 text-sm text-center">Já tem uma conta?</p>

        <Button asChild variant="outline" className="mt-4 w-full">
          <Link to={"/"}>
            <LogIn className="size-4" />
            Fazer login
          </Link>
        </Button>
      </div>

      <NotificationToast
        open={toastOpen}
        setOpen={setToastOpen}
        variantToast="error"
        description={toastDescription}
      />
    </div>
  );
}
