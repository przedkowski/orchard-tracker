import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./Button";

const linkBase =
  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150";
const linkInactive =
  "text-slate-400 hover:text-slate-100 hover:bg-slate-800";
const linkActive = "bg-emerald-900/50 text-emerald-400 font-semibold";

export function NavBar() {
  const { user, status, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/signin", { replace: true });
  };

  return (
    <nav
      data-testid="navbar"
      className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm"
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link
          to="/"
          data-testid="navbar-brand"
          className="flex items-center gap-2 text-base font-bold text-emerald-400 tracking-tight"
        >
          <span className="text-xl">🌳</span>
          Orchard Tracker
        </Link>

        {status === "authenticated" && (
          <div className="flex items-center gap-1">
            <NavLink
              to="/dashboard"
              data-testid="navbar-dashboard-link"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/sections"
              data-testid="navbar-sections-link"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Sections
            </NavLink>
            <NavLink
              to="/sprays"
              data-testid="navbar-sprays-link"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Sprays
            </NavLink>
            <NavLink
              to="/products"
              data-testid="navbar-products-link"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Products
            </NavLink>

            <div className="ml-3 flex items-center gap-2 border-l border-slate-700 pl-3">
              <span
                data-testid="navbar-user-name"
                className="hidden text-sm text-slate-500 sm:block"
              >
                {user?.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                data-testid="navbar-signout"
              >
                Sign out
              </Button>
            </div>
          </div>
        )}

        {status === "unauthenticated" && (
          <div className="flex items-center gap-2">
            <NavLink
              to="/signin"
              data-testid="navbar-signin-link"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Sign in
            </NavLink>
            <NavLink
              to="/signup"
              data-testid="navbar-signup-link"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Sign up
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}
