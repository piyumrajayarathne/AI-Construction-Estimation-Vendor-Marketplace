import { useParams } from "react-router-dom";
import { DocumentList } from "../components/DocumentList";
import { DocumentUploader } from "../components/DocumentUploader";
import { ErrorAlert } from "../components/ErrorAlert";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { ProjectTabs } from "../components/ProjectTabs";
import { useProjectDocuments } from "../hooks/useDocuments";
import { useProject } from "../hooks/useProjects";
import { getErrorMessage } from "../utils/errors";
import { toId } from "../utils/format";

export function ProjectDocumentsPage() {
  const { projectId } = useParams();
  const id = projectId ? toId(projectId) : undefined;
  const projectQuery = useProject(id);
  const documentsQuery = useProjectDocuments(id);

  if (!id) {
    return <ErrorAlert title="Project unavailable" message="Missing project id." />;
  }

  if (projectQuery.isLoading) {
    return <LoadingState label="Loading project" />;
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <ErrorAlert
        title="Project unavailable"
        message={getErrorMessage(
          projectQuery.error,
          "GET /api/projects/{id} did not return this project.",
        )}
        onRetry={() => void projectQuery.refetch()}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Documents"
        title={`${projectQuery.data.name} documents`}
        description="Upload drawings, specifications, existing BOQs, and other PDFs. Existing BOQs are inputs - they are not generated here."
      />
      <ProjectTabs projectId={id} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-ink">Uploaded files</h2>
            {documentsQuery.isFetching && !documentsQuery.isLoading ? (
              <span className="text-xs text-muted">Refreshing status...</span>
            ) : null}
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
            <DocumentList projectId={id} documents={documentsQuery.data ?? []} />
          )}
        </section>
        <section className="h-fit rounded-2xl border border-line bg-surface shadow-card p-4">
          <h2 className="mb-3 text-xl font-semibold text-ink">Upload</h2>
          <DocumentUploader projectId={id} />
        </section>
      </div>
    </div>
  );
}


