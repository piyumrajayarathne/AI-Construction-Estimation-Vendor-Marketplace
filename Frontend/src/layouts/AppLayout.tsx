import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bot,
  Building2,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Store,
  X,
} from "lucide-react";
import { BrandMark } from "../components/BrandMark";
import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../utils/cn";
import { titleCase } from "../utils/format";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/projects", label: "Projects", icon: FolderKanban, end: false },
  { to: "/assistant", label: "Agent workspace", icon: Bot, end: false },
  { to: "/marketplace", label: "Marketplace", icon: Store, end: false },
  { to: "/vendor", label: "Vendor", icon: Building2, end: false },
  { to: "/admin", label: "Admin", icon: Shield, end: false },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  function signOut() {
    navigate("/", { replace: true });
    logout();
    setOpen(false);
  }

  const nav = (
    <nav aria-label="Workspace navigation" className="space-y-1.5">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              isActive
                ? item.to === "/assistant"
                  ? "bg-area-ai/25 text-white ring-1 ring-inset ring-white/15"
                  : "bg-white/10 text-white ring-1 ring-inset ring-white/10"
                : "text-white/70 hover:translate-x-0.5 hover:bg-white/8 hover:text-white",
            )
          }
        >
          <item.icon className="h-[18px] w-[18px] text-white/65 transition group-hover:text-white" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  const roleColor =
    user?.role === "vendor"
      ? "text-[#E8C9A8]"
      : user?.role === "admin"
        ? "text-white/70"
        : "text-[#C9D8E8]";

  return (
    <div className="min-h-svh app-canvas lg:pl-[260px]">
      <aside className="fixed inset-y-0 left-0 hidden w-[260px] flex-col border-r border-white/10 bg-gradient-to-b from-secondary via-[#2C5573] to-[#273E55] px-4 py-5 text-white shadow-xl lg:flex sidebar-enter">
        <BrandMark inverse className="px-2" />
        <div className="mt-9 flex-1">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.2em] text-white/40">Workspace</p>
          {nav}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="truncate text-sm font-semibold">{user?.full_name}</p>
          <p className="mt-0.5 truncate text-xs text-white/55">{user?.email}</p>
          <p className={cn("mt-2 text-xs font-semibold uppercase tracking-[0.16em]", roleColor)}>
            {titleCase(user?.role)}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-start text-white/75 hover:bg-white/10 hover:text-white"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-h-svh flex-col">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-line bg-surface/95 px-4 shadow-[0_1px_3px_rgba(34,38,43,0.04)] backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-ink hover:bg-soft lg:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold text-ink">AURABUILD Agent</p>
              <p className="truncate text-xs text-muted">Construction intelligence workspace · Sri Lanka</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="rounded-full bg-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              {titleCase(user?.role)}
            </span>
            <span className="h-7 w-px bg-line" />
            <span className="max-w-[12rem] truncate text-sm font-medium text-ink">
              {user?.full_name}
            </span>
          </div>
        </header>
        {open ? (
          <div className="border-b border-secondary/20 bg-secondary px-4 py-4 lg:hidden">
            <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.2em] text-white/40">Workspace</p>
            {nav}
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-white/75 hover:bg-white/10 hover:text-white"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        ) : null}
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 sm:px-6 sm:py-7 xl:px-8">
          <div key={location.pathname} className="page-enter"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}










