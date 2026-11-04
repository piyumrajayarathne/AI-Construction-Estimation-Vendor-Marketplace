import logoUrl from "../assets/logo.svg";
import { cn } from "../utils/cn";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
  inverse?: boolean;
};

export function BrandMark({
  className,
  compact = false,
  inverse = false,
}: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img src={logoUrl} alt="" className="h-9 w-9 rounded-lg shadow-sm" />
      <span className="leading-tight">
        <span
          className={cn(
            "block font-display text-sm font-semibold tracking-[0.12em]",
            inverse ? "text-white" : "text-ink",
          )}
        >
          AURABUILD
        </span>
        {compact ? null : (
          <span
            className={cn(
              "block text-xs font-medium uppercase tracking-[0.16em]",
              inverse ? "text-white/70" : "text-muted",
            )}
          >
            Construction Intelligence
          </span>
        )}
      </span>
    </div>
  );
}



