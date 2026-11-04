import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none active:translate-y-0 active:scale-[0.99]",
        size === "sm" ? "min-h-9 px-3 text-sm" : "min-h-11 px-4 py-2.5 text-sm",
        variant === "primary" &&
          "bg-gradient-to-r from-secondary to-[#3D6B88] text-white shadow-md shadow-secondary/15 hover:-translate-y-0.5 hover:from-[#294F6A] hover:to-[#355F7D] hover:shadow-lg hover:shadow-secondary/20",
        variant === "secondary" &&
          "border border-line bg-gradient-to-b from-white to-soft text-ink shadow-sm hover:-translate-y-0.5 hover:border-secondary/25 hover:shadow-md",
        variant === "ghost" && "text-ink hover:-translate-y-px hover:bg-secondary/5 hover:text-secondary",
        variant === "danger" &&
          "bg-gradient-to-r from-danger to-[#A92121] text-white shadow-sm shadow-danger/15 hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
