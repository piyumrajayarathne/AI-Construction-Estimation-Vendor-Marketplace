import { useParams } from "react-router-dom";
import { ErrorAlert } from "../components/ErrorAlert";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { ProjectTabs } from "../components/ProjectTabs";
import { useProjectActivity } from "../hooks/useActivity";
import { useProject } from "../hooks/useProjects";
import { getErrorMessage } from "../utils/errors";
import { formatDateTime, titleCase, toId } from "../utils/format";

export function ProjectActivityPage() {
  const { projectId } = useParams();
  const id = projectId ? toId(projectId) : undefined;
  const projectQuery = useProject(id);
  const activityQuery = useProjectActivity(id);

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

  const events = activityQuery.data ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Activity"
        title={`${projectQuery.data.name} activity`}
        description="Events recorded for this project: creates, edits, uploads, and processing outcomes."
      />
      <ProjectTabs projectId={id} />
      {activityQuery.isLoading ? (
        <LoadingState label="Loading activity" />
      ) : activityQuery.isError ? (
        <ErrorAlert
          title="Could not load activity"
          message={getErrorMessage(
            activityQuery.error,
            "GET /api/projects/{id}/activity failed.",
          )}
          onRetry={() => void activityQuery.refetch()}
        />
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface px-4 py-10 text-center text-sm text-muted">
          No activity yet. Creating a project or uploading a document will appear
          here.
        </div>
      ) : (
        <ol className="space-y-3">
          {events.map((event) => (
            <li
              key={toId(event.id)}
              className="rounded-2xl border border-line bg-surface shadow-card px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                  {titleCase(event.event_type)}
                </p>
                <p className="text-xs text-subtle">
                  {formatDateTime(event.created_at)}
                </p>
              </div>
              <p className="mt-1 text-sm text-ink">{event.message}</p>
              {event.actor_email ? (
                <p className="mt-1 text-xs text-muted">{event.actor_email}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}


