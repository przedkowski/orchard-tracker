import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./Button";

const linkBase = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
const linkInactive = "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
const linkActive = "bg-emerald-50 text-emerald-700";

export function NavBar() {
  const { user, status, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/signin", { replace: true });
  };

  return (
    <nav data-testid="navbar" className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          to="/"
          data-testid="navbar-brand"
          className="text-lg font-semibold text-emerald-700"
        >
          🌳 Orchard Tracker
        </Link>

        {status === "authenticated" && (
          <div className="flex items-center gap-2">
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
            <span
              data-testid="navbar-user-name"
              className="ml-2 text-sm text-slate-600"
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
