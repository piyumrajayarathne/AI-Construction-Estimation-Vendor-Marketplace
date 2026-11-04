import { TriangleAlert } from "lucide-react";

type ErrorAlertProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorAlert({ title = "Something went wrong", message, onRetry }: ErrorAlertProps) {
  return (
    <div role="alert" className="flex gap-3 rounded-2xl border border-[#F1C0C0] bg-[#FBE9E9] px-4 py-4 text-sm text-danger">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-danger">
        <TriangleAlert className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="mt-1 leading-5 text-danger/90">{message}</p>
        {onRetry ? (
          <button type="button" onClick={onRetry} className="mt-3 rounded-lg font-semibold text-danger underline underline-offset-4 hover:text-danger/80">
            Try again
          </button>
        ) : null}
      </div>
    </div>
  );
}

