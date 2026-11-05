import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { ErrorAlert } from "../components/ErrorAlert";
import { Field, TextArea, TextInput } from "../components/Field";
import { PageHeader } from "../components/PageHeader";
import { useCreateProject } from "../hooks/useProjects";
import { getErrorMessage } from "../utils/errors";
import { toId } from "../utils/format";

export function CreateProjectPage() {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Project name is required.");
      return;
    }
    let budgetCap: number | null | undefined;
    if (budget.trim()) {
      const parsed = Number(budget);
      if (Number.isNaN(parsed) || parsed < 0) {
        setError("Budget cap must be a positive number.");
        return;
      }
      budgetCap = parsed;
    }
    try {
      const project = await createProject.mutateAsync({
        name: trimmedName,
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        budget_cap: budgetCap,
      });
      navigate(`/projects/${toId(project.id)}`);
    } catch (err) {
      setError(
        getErrorMessage(err, "POST /api/projects rejected the new project."),
      );
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Projects"
        title="Create project"
        description="Open a job folder for drawings. You can upload PDFs as soon as the project exists."
      />
      <form
        onSubmit={onSubmit}
        className="max-w-xl space-y-4 rounded-2xl border border-line bg-surface shadow-card p-5 sm:p-6"
      >
        {error ? <ErrorAlert title="Could not create project" message={error} /> : null}
        <Field label="Project name" htmlFor="name">
          <TextInput
            id="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Benchmark Residences - Block A masonry"
          />
        </Field>
        <Field label="Location" htmlFor="location">
          <TextInput
            id="location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Colombo, Sri Lanka"
          />
        </Field>
        <Field
          label="Budget cap"
          htmlFor="budget_cap"
          hint="Optional numeric cap you supply. Currency is not assumed and is not invented."
        >
          <TextInput
            id="budget_cap"
            inputMode="decimal"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            placeholder="Optional"
          />
        </Field>
        <Field label="Description" htmlFor="description">
          <TextArea
            id="description"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Scope notes, storey count, or what the first PDFs cover."
          />
        </Field>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" loading={createProject.isPending}>
            Create project
          </Button>
          <Link to="/projects">
            <Button variant="secondary">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

