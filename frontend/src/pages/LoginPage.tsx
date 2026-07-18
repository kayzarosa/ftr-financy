import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, UserRoundPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import z from "zod";
import logo from "@/assets/logo.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationToast } from "@/components/ui/notification-toast";
import { useSignIn } from "@/hooks/use-sign-in";
import { getErrorMessage } from "@/lib/get-error-message";
import { useAuthStore } from "@/stores/auth-store";

const loginSchema = z.object({
  email: z.email("E-mail é inválido"),
  password: z.string().min(8, "Senha é obrigatória, mínimo 8 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const signIn = useSignIn();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastDescription, setToastDescription] = useState("");

  function onSubmit(values: LoginFormValues) {
    signIn.mutate(values, {
      onSuccess: (data) => {
        setAuth(data.signIn);
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

      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 text-center gap-1">
          <h1 className="text-gray-800 font-bold text-[20px]">Fazer login</h1>
          <p className="text-[16px] font-normal text-gray-600">Entre na sua conta para continuar</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
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
          />

          <div className="flex items-center flex-row justify-between text-sm">
            <label
              htmlFor="remember-me"
              className="flex flex-row justify-center items-center gap-2 text-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                name="remember-me"
                id="remember-me"
                className="size-4 border-gray-300 accent-brand-base"
              />
              Lembrar-me
            </label>

            <a href="#" className="font-medium text-sm text-brand-base cursor-pointer">
              Recuperar senha
            </a>
          </div>

          <Button variant="primary" className="mt-2" isLoading={signIn.isPending}>
            {signIn.isPending ? "Entrando" : "Entrar"}
          </Button>
        </form>

        <div className="flex items-center gap-3 text-sm text-gray-500 mt-6 mb-6">
          <div className="h-px flex-1 bg-gray-300" />
          ou
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        <p className="text-gray-600 text-sm text-center">Ainda não tem uma conta?</p>

        <Button asChild variant="outline" className="mt-4 w-full">
          <Link to={"/cadastro"}>
            <UserRoundPlus className="size-4" />
            Criar conta
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
