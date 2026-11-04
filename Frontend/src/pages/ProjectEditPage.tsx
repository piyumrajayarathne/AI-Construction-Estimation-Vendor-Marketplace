import { useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { ErrorAlert } from "../components/ErrorAlert";
import { Field, TextArea, TextInput } from "../components/Field";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { ProjectTabs } from "../components/ProjectTabs";
import { usePatchProject, useProject } from "../hooks/useProjects";
import { getErrorMessage } from "../utils/errors";
import { toId } from "../utils/format";

export function ProjectEditPage() {
  const { projectId } = useParams();
  const id = projectId ? toId(projectId) : undefined;
  const projectQuery = useProject(id);

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
        eyebrow="Project"
        title={`Edit ${projectQuery.data.name}`}
        description="Update the job folder. Status is not changed here unless you save a new name or notes."
      />
      <ProjectTabs projectId={id} />
      <ProjectEditForm key={id} projectId={id} />
    </div>
  );
}

function ProjectEditForm({ projectId }: { projectId: string }) {
  const projectQuery = useProject(projectId);
  const patchProject = usePatchProject(projectId);
  const project = projectQuery.data;
  const [name, setName] = useState(project?.name ?? "");
  const [location, setLocation] = useState(project?.location ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await patchProject.mutateAsync({
        name: name.trim(),
        location: location.trim() || undefined,
        description: description.trim() || undefined,
      });
      setSaved(true);
    } catch (err) {
      setError(
        getErrorMessage(err, "PATCH /api/projects/{id} rejected the update."),
      );
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-xl space-y-3 rounded-2xl border border-line bg-surface shadow-card p-5"
    >
      <h2 className="text-xl font-semibold text-ink">Project details</h2>
      {error ? <ErrorAlert title="Save failed" message={error} /> : null}
      {saved ? <p className="text-sm text-success">Details saved.</p> : null}
      <Field label="Name" htmlFor="edit-name">
        <TextInput
          id="edit-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </Field>
      <Field label="Location" htmlFor="edit-location">
        <TextInput
          id="edit-location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
      </Field>
      <Field label="Description" htmlFor="edit-description">
        <TextArea
          id="edit-description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
      <Button type="submit" size="sm" loading={patchProject.isPending}>
        Save changes
      </Button>
    </form>
  );
}


