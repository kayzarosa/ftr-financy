import { Link, NavLink, Outlet } from "react-router-dom";
import { tv } from "tailwind-variants";
import logo from "@/assets/logo.svg";
import { getInitials } from "@/lib/get-initials";
import { useAuthStore } from "@/stores/auth-store";

const navLinkVariants = tv({
  base: "text-sm font-medium transition-colors",
  variants: {
    isActive: {
      true: "text-brand-base font-semibold",
      false: "text-gray-600 hover:text-brand-dark",
    },
  },
});

export function AppLayout() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
        <img src={logo} alt="Financy" className="h-6 ml-3.5" />

        <nav className="flex items-center gap-5">
          <NavLink to="/" end className={({ isActive }) => navLinkVariants({ isActive })}>
            Dashboard
          </NavLink>
          <NavLink to="/transacoes" className={({ isActive }) => navLinkVariants({ isActive })}>
            Transações
          </NavLink>
          <NavLink to="/categorias" className={({ isActive }) => navLinkVariants({ isActive })}>
            Categorias
          </NavLink>
        </nav>

        <div className="flex size-9 items-center justify-center rounded-full bg-gray-300 text-sm font-semibold text-gray-800">
          <Link to="/usuario">{user ? getInitials(user.name) : "?"}</Link>
        </div>
      </header>

      <main className="p-12">
        <Outlet />
      </main>
    </div>
  );
}
