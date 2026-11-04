import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({ label = "Loading", className }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className={cn("flex items-center justify-center gap-3 py-16 text-sm font-medium text-muted", className)}>
      <Loader2 className="h-5 w-5 animate-spin text-secondary" />
      <span>{label}</span>
    </div>
  );
}

export function PageSpinner({ label = "Loading workspace" }: { label?: string }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas px-4">
      <LoadingState label={label} />
    </div>
  );
}


