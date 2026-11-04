import { NavLink } from "react-router-dom";
import { cn } from "../utils/cn";

type ProjectTabsProps = {
  projectId: string;
};

const TABS = [
  { suffix: "", label: "Overview", end: true },
  { suffix: "/documents", label: "Documents", end: false },
  { suffix: "/activity", label: "Activity", end: false },
  { suffix: "/estimation", label: "Estimation", end: false },
  { suffix: "/edit", label: "Edit", end: false },
];

export function ProjectTabs({ projectId }: ProjectTabsProps) {
  const base = `/projects/${projectId}`;
  return (
    <nav aria-label="Project sections" className="mb-7 flex gap-1 overflow-x-auto border-b border-line">
      {TABS.map((tab) => (
        <NavLink
          key={tab.label}
          to={`${base}${tab.suffix}`}
          end={tab.end}
          className={({ isActive }) =>
            cn(
              "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-px",
              isActive
                ? "border-secondary text-secondary"
                : "border-transparent text-muted hover:border-line hover:text-ink",
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}



