import { cn } from "../utils/cn";
import { titleCase } from "../utils/format";

type Tone = { badge: string; dot: string };

const PROJECT_STYLES: Record<string, Tone> = {
  draft: { badge: "border-line bg-[#F1F2F2] text-muted", dot: "bg-neutral" },
  analyzing: { badge: "border-[#CDE5F4] bg-[#EAF4FB] text-information", dot: "bg-information" },
  estimated: { badge: "border-[#CFE6D6] bg-[#E8F5EE] text-success", dot: "bg-success" },
  sourcing: { badge: "border-[#E9D8A2] bg-[#FFF3CD] text-warning-text", dot: "bg-warning" },
  quoted: { badge: "border-[#DDD0EF] bg-[#F0E9F8] text-area-ai", dot: "bg-area-ai" },
  closed: { badge: "border-line bg-[#F1F2F2] text-muted", dot: "bg-neutral" },
};

const DOCUMENT_STYLES: Record<string, Tone> = {
  pending: { badge: "border-[#E9D8A2] bg-[#FFF3CD] text-warning-text", dot: "bg-warning" },
  processing: { badge: "border-[#CDE5F4] bg-[#EAF4FB] text-information", dot: "bg-information" },
  processed: { badge: "border-[#CFE6D6] bg-[#E8F5EE] text-success", dot: "bg-success" },
  failed: { badge: "border-[#F1C0C0] bg-[#FBE9E9] text-danger", dot: "bg-danger" },
};

const VERIFY_STYLES: Record<string, Tone> = {
  unverified: { badge: "border-line bg-[#F1F2F2] text-muted", dot: "bg-neutral" },
  needs_review: { badge: "border-[#E9D8A2] bg-[#FFF3CD] text-warning-text", dot: "bg-warning" },
  verified: { badge: "border-[#CFE6D6] bg-[#E8F5EE] text-success", dot: "bg-success" },
};

const UNKNOWN: Tone = {
  badge: "border-line bg-[#F1F2F2] text-muted",
  dot: "bg-neutral",
};

type StatusBadgeProps = {
  value?: string | null;
  kind?: "project" | "document" | "verification";
  className?: string;
};

export function StatusBadge({ value, kind = "project", className }: StatusBadgeProps) {
  const key = (value ?? "unknown").toLowerCase();
  const palette = kind === "document"
    ? DOCUMENT_STYLES
    : kind === "verification"
      ? VERIFY_STYLES
      : PROJECT_STYLES;
  const tone = palette[key] ?? UNKNOWN;
  const isActive = (kind === "document" && key === "processing") || (kind === "project" && key === "analyzing");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-4",
        tone.badge,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", tone.dot, isActive && "animate-status-pulse")} />
      {titleCase(value)}
    </span>
  );
}


