import { Link } from "react-router-dom";
import { Button } from "../components/Button";

export function NotFoundPage() {
  return (
    <div className="page-enter app-canvas flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
        404
      </p>
      <h1 className="mt-2 text-[30px] leading-tight font-semibold tracking-tight text-ink">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        That route is not part of the AURABUILD workspace.
      </p>
      <Link to="/" className="mt-6">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}





