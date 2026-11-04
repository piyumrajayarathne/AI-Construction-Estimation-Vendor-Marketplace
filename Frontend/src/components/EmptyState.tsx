import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center shadow-card sm:py-14">
      {icon ? (
        <div className="mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-[#F0E9F8] text-secondary">
          {icon}
        </div>
      ) : null}
      <h2 className="type-card-title text-ink">{title}</h2>
      <p className="type-body mt-2 max-w-md text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}




