import { Outlet, useLocation } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";

const authImage =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1500&q=85";

export function AuthLayout() {
  const location = useLocation();
  return (
    <div className="grid min-h-svh auth-canvas lg:grid-cols-[1.04fr_0.96fr]">
      <aside className="relative hidden overflow-hidden bg-secondary p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <img src={authImage} alt="Construction project in progress" className="absolute inset-0 h-full w-full object-cover animate-image-drift" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-secondary/95 via-[#31556F]/85 to-area-ai/70" />
        <div className="relative">
          <BrandMark inverse />
        </div>
        <div className="relative max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">
            Construction, with clarity.
          </p>
          <h1 className="mt-4 text-[30px] font-semibold leading-tight tracking-[-0.025em] xl:text-[32px]">
            A clearer view of every project.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/80">
            Keep project details, drawings, specifications, and existing BOQs together. Review extracted information with its source in view.
          </p>
          <div className="mt-8 flex flex-wrap gap-2 text-xs font-medium text-white/90">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">Project workspace</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">Document review</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">Transparent status</span>
          </div>
        </div>
        <p className="relative text-xs text-white/65">AURABUILD · Benchmark Residences · Sri Lanka</p>
      </aside>
      <div className="flex min-h-svh flex-col auth-canvas">
        <div className="flex items-center justify-between bg-secondary px-5 py-4 text-white lg:hidden">
          <BrandMark inverse />
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
            Construction Intelligence
          </span>
        </div>
        <main className="grid flex-1 place-items-center px-4 py-8 sm:px-7 sm:py-10 lg:px-10">
          <div key={location.pathname} className="page-enter w-full max-w-md">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}











