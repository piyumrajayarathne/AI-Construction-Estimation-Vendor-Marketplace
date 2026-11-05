import { Link } from "react-router-dom";
import { FolderKanban, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ErrorAlert } from "../components/ErrorAlert";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { TextInput } from "../components/Field";
import { useProjects } from "../hooks/useProjects";
import { getErrorMessage } from "../utils/errors";
import { formatDateTime, formatNumber, toId } from "../utils/format";

export function ProjectListPage() {
  const projectsQuery = useProjects();
  const [query, setQuery] = useState("");
  const projects = useMemo(() => {
    const list = projectsQuery.data ?? [];
    const needle = query.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((project) =>
      [project.name, project.location, project.status, project.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [projectsQuery.data, query]);

  return (
    <div>
      <PageHeader
        eyebrow="Projects"
        title="Project list"
        description="Every job you own. Open a project to upload PDFs, review activity, or check masonry estimation status."
        actions={
          <Link to="/projects/new">
            <Button>
              <Plus className="h-4 w-4" />
              Create project
            </Button>
          </Link>
        }
      />

      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        <TextInput
          className="pl-9"
          placeholder="Filter by name, location, or status"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Filter projects"
        />
      </div>

      {projectsQuery.isLoading ? (
        <LoadingState label="Loading projects" />
      ) : projectsQuery.isError ? (
        <ErrorAlert
          title="Could not load projects"
          message={getErrorMessage(
            projectsQuery.error,
            "GET /api/projects did not succeed.",
          )}
          onRetry={() => void projectsQuery.refetch()}
        />
      ) : (projectsQuery.data ?? []).length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-5 w-5" />}
          title="No projects yet"
          description="Create a project to start the document flow."
          action={
            <Link to="/projects/new">
              <Button>Create project</Button>
            </Link>
          }
        />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No matching projects"
          description="Try a different name, location, or status."
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-soft text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Budget cap</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {projects.map((project) => (
                  <tr key={toId(project.id)} className="hover:bg-soft">
                    <td className="px-4 py-3">
                      <Link
                        to={`/projects/${toId(project.id)}`}
                        className="font-medium text-secondary hover:underline"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {project.location || "-"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatNumber(project.budget_cap)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={project.status ?? "draft"} />
                    </td>
                    <td className="px-4 py-3 text-subtle">
                      {formatDateTime(project.updated_at ?? project.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-3 md:hidden">
            {projects.map((project) => (
              <li key={toId(project.id)}>
                <Link
                  to={`/projects/${toId(project.id)}`}
                  className="block rounded-2xl border border-line bg-surface shadow-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-ink">{project.name}</p>
                    <StatusBadge value={project.status ?? "draft"} />
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {project.location || "No location"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}


