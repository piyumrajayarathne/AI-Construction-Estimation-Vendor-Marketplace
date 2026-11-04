import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "../utils/cn";

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && !error ? (
        <span className="mt-1 block text-xs text-muted">{hint}</span>
      ) : null}
      {error ? (
        <span className="mt-1 block text-xs text-danger">{error}</span>
      ) : null}
    </label>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function TextInput({ className, invalid, ...props }: TextInputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border bg-surface px-3.5 py-3 text-base text-ink shadow-sm outline-none transition placeholder:text-subtle focus:ring-4 focus:ring-secondary/15",
        invalid
          ? "border-danger focus:border-danger"
          : "border-line focus:border-secondary",
        className,
      )}
      {...props}
    />
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export function TextArea({ className, invalid, ...props }: TextAreaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border bg-surface px-3.5 py-3 text-base text-ink shadow-sm outline-none transition placeholder:text-subtle focus:ring-4 focus:ring-secondary/15",
        invalid
          ? "border-danger focus:border-danger"
          : "border-line focus:border-secondary",
        className,
      )}
      {...props}
    />
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export function SelectInput({ className, invalid, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border bg-surface px-3.5 py-3 text-base text-ink shadow-sm outline-none transition focus:ring-4 focus:ring-secondary/15",
        invalid
          ? "border-danger focus:border-danger"
          : "border-line focus:border-secondary",
        className,
      )}
      {...props}
    />
  );
}





