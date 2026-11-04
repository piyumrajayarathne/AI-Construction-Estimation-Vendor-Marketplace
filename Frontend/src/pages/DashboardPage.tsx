import { Link } from "react-router-dom";
import { ArrowRight, Bot, FileText, FolderKanban, Plus } from "lucide-react";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ErrorAlert } from "../components/ErrorAlert";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import { useAiStatus } from "../hooks/useAi";
import { useProjects } from "../hooks/useProjects";
import { getErrorMessage } from "../utils/errors";
import { formatDateTime, toId } from "../utils/format";
import { VendorHomePage } from "./VendorHomePage";

export function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === "vendor") {
    return <VendorHomePage />;
  }
  return <CustomerDashboard />;
}

function CustomerDashboard() {
  const { user } = useAuth();
  const projectsQuery = useProjects();
  const agentQuery = useAiStatus();
  const projects = projectsQuery.data ?? [];
  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  return (
    <div>
      <PageHeader
        eyebrow="Project command center"
        title={`Good to see you, ${firstName}`}
        description="Bring project files and agent-supported document review into one clear workspace."
        actions={
          <Link to="/projects/new">
            <Button>
              <Plus className="h-4 w-4" />
              New project
            </Button>
          </Link>
        }
      />

      <AgentStatusCard
        checking={agentQuery.isLoading}
        connected={Boolean(agentQuery.data?.connected)}
        unavailable={agentQuery.isError}
        message={agentQuery.data?.message}
      />

      {projectsQuery.isLoading ? (
        <LoadingState label="Loading projects" />
      ) : projectsQuery.isError ? (
        <ErrorAlert
          title="Could not load dashboard"
          message={getErrorMessage(projectsQuery.error, "The projects API did not respond.")}
          onRetry={() => void projectsQuery.refetch()}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Projects" value={String(projects.length)} hint="Owned in this workspace" />
            <StatCard
              label="Drafts"
              value={String(projects.filter((project) => project.status === "draft").length)}
              hint="Ready for drawings"
            />
            <StatCard
              label="In analysis"
              value={String(projects.filter((project) => project.status === "analyzing").length)}
              hint="Status from the projects API"
            />
          </div>

          <section className="mt-9">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Your workspace</p>
                <h2 className="mt-1 text-xl font-semibold text-ink">Recent projects</h2>
              </div>
              <Link to="/projects" className="text-sm font-semibold text-secondary hover:underline">
                View all
              </Link>
            </div>
            {projects.length === 0 ? (
              <EmptyState
                icon={<FolderKanban className="h-5 w-5" />}
                title="No projects yet"
                description="Create a project to upload PDFs and follow document processing."
                action={<Link to="/projects/new"><Button>Create project</Button></Link>}
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                <ul className="divide-y divide-line">
                  {projects.slice(0, 6).map((project) => (
                    <li key={toId(project.id)}>
                      <Link
                        to={`/projects/${toId(project.id)}`}
                        className="flex flex-col gap-2 px-5 py-4 transition hover:bg-soft sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{project.name}</p>
                          <p className="mt-1 text-xs text-muted">
                            {project.location || "No location"} · updated {formatDateTime(project.updated_at ?? project.created_at)}
                          </p>
                        </div>
                        <StatusBadge value={project.status ?? "draft"} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              { step: "01", title: "Create a project", body: "Name the job and keep it in draft while drawings arrive." },
              { step: "02", title: "Add source documents", body: "Upload drawings, specifications, or existing BOQs for processing." },
              { step: "03", title: "Review with context", body: "Open processed pages and check the information before relying on it." },
            ].map((item) => (
              <article key={item.step} className="rounded-2xl border border-line bg-surface p-5 shadow-card">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Step {item.step}</p>
                <h3 className="mt-2 text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function AgentStatusCard({
  checking,
  connected,
  unavailable,
  message,
}: {
  checking: boolean;
  connected: boolean;
  unavailable: boolean;
  message?: string | null;
}) {
  const label = checking ? "Checking status" : unavailable ? "Status unavailable" : connected ? "Connected" : "Not connected";
  const statusTone = connected
    ? "bg-[#E8F5EE] text-success"
    : unavailable
      ? "bg-[#FBE9E9] text-danger"
      : "bg-[#2B194A] text-[#E3D5F7]";

  return (
    <section className="relative mb-8 grid gap-5 overflow-hidden rounded-3xl agent-glow p-5 text-white shadow-card sm:p-7 lg:grid-cols-[1.35fr_0.85fr]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-area-ai/35 blur-3xl" />
      <div className="relative flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-area-ai/35 text-white ring-1 ring-inset ring-white/15">
          <Bot className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/65">AURABUILD Agent</p>
          <h2 className="mt-1 text-xl font-semibold leading-snug">Construction context, ready for review.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            See the live model connection and explore the source-aware workflow available to your team.
          </p>
          <Link to="/assistant" className="mt-4 inline-flex">
            <Button variant="secondary" className="border-transparent bg-white text-secondary shadow-none hover:border-transparent hover:bg-soft">
              Open agent workspace <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="relative self-stretch rounded-2xl border border-white/10 bg-ink/15 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Live connection</p>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${statusTone}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-success" : unavailable ? "bg-danger" : "bg-area-ai"}`} />
            {label}
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-white/75">
          {message || (unavailable
            ? "The agent status service could not be reached. Project tools remain available."
            : connected
              ? "The model is connected. Agent responses remain tied to available project sources."
              : "No model is configured in this environment. Project and document tools remain available.")}
        </p>
      </div>
    </section>
  );
}
function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <FileText className="h-4 w-4 text-area-ai" />
      </div>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-subtle">{hint}</p>
    </article>
  );
}


