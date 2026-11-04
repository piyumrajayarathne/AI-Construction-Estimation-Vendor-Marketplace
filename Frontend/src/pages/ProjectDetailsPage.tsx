import { Link, useParams } from "react-router-dom";
import { Ruler } from "lucide-react";
import { Button } from "../components/Button";
import { DocumentList } from "../components/DocumentList";
import { ErrorAlert } from "../components/ErrorAlert";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { ProjectTabs } from "../components/ProjectTabs";
import { StatusBadge } from "../components/StatusBadge";
import { useProjectDocuments } from "../hooks/useDocuments";
import { useProject } from "../hooks/useProjects";
import { getErrorMessage } from "../utils/errors";
import { formatDateTime, formatNumber, toId } from "../utils/format";

export function ProjectDetailsPage() {
  const { projectId } = useParams();
  const id = projectId ? toId(projectId) : undefined;
  const projectQuery = useProject(id);
  const documentsQuery = useProjectDocuments(id);
  const project = projectQuery.data;

  return (
    <div>
      {projectQuery.isLoading ? (
        <LoadingState label="Loading project" />
      ) : projectQuery.isError || !project || !id ? (
        <ErrorAlert
          title="Project unavailable"
          message={getErrorMessage(
            projectQuery.error,
            "GET /api/projects/{id} did not return this project.",
          )}
          onRetry={() => void projectQuery.refetch()}
        />
      ) : (
        <>
          <PageHeader
            eyebrow="Project"
            title={project.name}
            description={project.description || "No description provided."}
            actions={
              <Link to={`/projects/${id}/estimation`}>
                <Button variant="secondary">
                  <Ruler className="h-4 w-4" />
                  Masonry estimation
                </Button>
              </Link>
            }
          />
          <ProjectTabs projectId={id} />
          <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-line bg-surface p-4 text-sm text-muted shadow-card">
            <StatusBadge value={project.status ?? "draft"} />
            <span>{project.location || "No location"}</span>
            <span>Budget cap {formatNumber(project.budget_cap)}</span>
            <span>Created {formatDateTime(project.created_at)}</span>
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-ink">Documents</h2>
              <Link
                to={`/projects/${id}/documents`}
                className="text-sm font-medium text-secondary hover:underline"
              >
                Open documents
              </Link>
            </div>
            {documentsQuery.isLoading ? (
              <LoadingState label="Loading documents" className="py-10" />
            ) : documentsQuery.isError ? (
              <ErrorAlert
                title="Could not load documents"
                message={getErrorMessage(
                  documentsQuery.error,
                  "GET /api/projects/{id}/documents failed.",
                )}
                onRetry={() => void documentsQuery.refetch()}
              />
            ) : (
              <DocumentList
                projectId={id}
                documents={(documentsQuery.data ?? []).slice(0, 8)}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}




