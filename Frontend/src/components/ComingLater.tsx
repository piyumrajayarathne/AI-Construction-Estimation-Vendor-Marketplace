import type { ReactNode } from "react";
import { PageHeader } from "./PageHeader";

type ComingLaterProps = {
  area: "storefront" | "vendor" | "admin";
  title: string;
  description: string;
  items: string[];
  extra?: ReactNode;
};

const AREA = {
  storefront: {
    eyebrow: "Marketplace",
    color: "text-area-storefront",
    border: "border-area-storefront/25",
    bg: "bg-[#F8EEEB]",
  },
  vendor: {
    eyebrow: "Vendor",
    color: "text-area-vendor",
    border: "border-area-vendor/25",
    bg: "bg-[#F4EEE8]",
  },
  admin: {
    eyebrow: "Admin",
    color: "text-area-admin",
    border: "border-area-admin/25",
    bg: "bg-[#EEEFF1]",
  },
} as const;

export function ComingLater({ area, title, description, items, extra }: ComingLaterProps) {
  const theme = AREA[area];
  return (
    <div>
      <PageHeader eyebrow={theme.eyebrow} title={title} description={description} />
      <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className={`border-b px-5 py-5 sm:px-7 ${theme.border} ${theme.bg}`}>
          <p className={`text-xs font-bold uppercase tracking-[0.14em] ${theme.color}`}>
            Planned capability
          </p>
          <h2 className="type-section-title mt-2 text-ink">Coming later</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            This area is a foundation placeholder. It is not live and does not call marketplace, quotation, or admin APIs.
          </p>
        </div>
        <div className="p-5 sm:p-7">
          <p className="text-sm font-semibold text-ink">What this area is planned to support</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item} className="hover-lift rounded-2xl border border-line bg-gradient-to-br from-soft to-white px-4 py-3 text-sm leading-5 text-muted">
                {item}
              </li>
            ))}
          </ul>
          {extra ? <div className="mt-6">{extra}</div> : null}
        </div>
      </section>
    </div>
  );
}




