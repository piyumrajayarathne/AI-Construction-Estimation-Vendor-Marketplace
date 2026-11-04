import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="page-heading-enter mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="type-page-title max-w-4xl text-ink">
          {title}
        </h1>
        {description ? (
          <p className="type-body mt-2 max-w-3xl text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2.5 sm:pt-1">{actions}</div>
      ) : null}
    </div>
  );
}






