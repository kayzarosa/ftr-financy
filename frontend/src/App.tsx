import * as Toast from "@radix-ui/react-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/app-layout";
import { CategoriesPage } from "./pages/CategoriesPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SignUpPage } from "./pages/SignUpPage";
import { useAuthStore } from "./stores/auth-store";

export function App() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return (
    <Toast.Provider swipeDirection="up" duration={7000}>
      <Routes>
        {accessToken ? (
          <Route element={<AppLayout />}>
            <Route path="/" element={<div>Dashboard</div>} />
            <Route path="/transacoes" element={<div>Transações</div>} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/usuario" element={<ProfilePage />} />
          </Route>
        ) : (
          <Route path="/" element={<LoginPage />} />
        )}

        <Route path="/cadastro" element={<SignUpPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toast.Viewport className="fixed top-0 right-0 z-100 m-4 w-auto max-w-sm outline-none" />
    </Toast.Provider>
  );
}
