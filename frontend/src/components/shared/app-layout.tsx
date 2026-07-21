import { Link, NavLink, Outlet } from "react-router-dom";
import { tv } from "tailwind-variants";
import logo from "@/assets/logo.svg";
import { getInitials } from "@/lib/helpers/get-initials";
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
      <header
        className={`flex flex-wrap items-center justify-between gap-y-3 border-b 
        border-gray-200 bg-white px-4 py-4 sm:px-8`}
      >
        <img src={logo} alt="Financy" className="h-6" />

        <nav
          className={`order-last flex w-full items-center justify-between gap-5 sm:order-0 sm:w-auto sm:justify-normal`}
        >
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

      <main className="px-4 py-4 sm:px-12">
        <Outlet />
      </main>
    </div>
  );
}
