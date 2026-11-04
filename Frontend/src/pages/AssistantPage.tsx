import { Bot, FileSearch, ShieldCheck, Sparkles } from "lucide-react";
import { ErrorAlert } from "../components/ErrorAlert";
import { PageHeader } from "../components/PageHeader";
import { useAiStatus } from "../hooks/useAi";
import { getErrorMessage } from "../utils/errors";

export function AssistantPage() {
  const statusQuery = useAiStatus();
  const status = statusQuery.data;
  const connected = Boolean(status?.connected);
  const statusLabel = statusQuery.isLoading
    ? "Checking connection"
    : statusQuery.isError
      ? "Status unavailable"
      : connected
        ? "Model connected"
        : "Agent offline";
  const statusTone = connected
    ? "bg-[#E8F5EE] text-success"
    : statusQuery.isError
      ? "bg-[#FBE9E9] text-danger"
      : "bg-[#F0E9F8] text-area-ai";

  return (
    <div>
      <PageHeader
        eyebrow="Agent workspace"
        title="AURABUILD Agent"
        description="A project-aware interface for source-grounded construction document review. Agent availability is reported live by the backend."
      />

      {statusQuery.isError ? (
        <div className="mb-6">
          <ErrorAlert
            title="Could not reach agent status"
            message={getErrorMessage(statusQuery.error, "The AI status service could not be reached.")}
            onRetry={() => void statusQuery.refetch()}
          />
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.75fr)]">
        <section className="overflow-hidden rounded-3xl border border-area-ai/20 bg-surface shadow-card">
          <div className="flex flex-col gap-4 border-b border-area-ai/15 bg-gradient-to-r from-[#F0E9F8] via-white to-[#EAF1F5] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-area-ai text-white shadow-sm">
                <Bot className="h-6 w-6" />
              </span>
              <div>
                <p className="text-base font-semibold text-ink">Project document agent</p>
                <p className="mt-0.5 text-sm text-muted">AURABUILD · Source-aware workflow</p>
              </div>
            </div>
            <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${statusTone}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-success" : statusQuery.isError ? "bg-danger" : "bg-area-ai"}`} />
              {statusLabel}
            </span>
          </div>

          <div className="flex min-h-[360px] flex-col items-center justify-center bg-white px-5 py-10 text-center sm:px-10">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0E9F8] text-area-ai">
              {connected ? <Sparkles className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
            </span>
            <h2 className="mt-5 text-xl font-semibold text-ink">
              {connected ? "The model is connected" : "Your agent workspace is ready"}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              {connected
                ? "The model connection is available. Conversational requests are not wired in this build yet; project and document review remain available."
                : status?.message || "The agent is not connected to a language model in this environment. You can still manage projects and review processed document text."}
            </p>
            <div className="mt-7 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-soft p-4">
                <FileSearch className="h-5 w-5 text-area-ai" />
                <p className="mt-3 text-sm font-semibold text-ink">Project sources first</p>
                <p className="mt-1 text-xs leading-5 text-muted">Use processed project documents as the context for review.</p>
              </div>
              <div className="rounded-2xl border border-line bg-soft p-4">
                <ShieldCheck className="h-5 w-5 text-area-ai" />
                <p className="mt-3 text-sm font-semibold text-ink">Human review stays in control</p>
                <p className="mt-1 text-xs leading-5 text-muted">Missing data and unverified details remain visible.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-line bg-soft p-4 sm:p-5">
            <label htmlFor="agent-message" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">Message the agent</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                id="agent-message"
                disabled
                rows={2}
                className="min-h-[76px] flex-1 resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-subtle shadow-sm"
                placeholder={connected ? "Conversation endpoint is not enabled in this build" : "Connect a model to start a conversation"}
              />
              <button type="button" disabled className="min-h-11 rounded-xl bg-secondary px-5 text-sm font-semibold text-white opacity-45 sm:self-end">Send</button>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0E9F8] text-area-ai"><Sparkles className="h-5 w-5" /></span>
              <div>
                <h2 className="text-base font-semibold text-ink">Agent guardrails</h2>
                <p className="text-xs text-muted">What the workspace protects</p>
              </div>
            </div>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-area-ai" />Existing BOQs remain source documents.</li>
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-area-ai" />No quantities or rates are invented.</li>
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-area-ai" />Missing data remains visible for review.</li>
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-area-ai" />Unverified details stay marked unverified.</li>
            </ul>
          </section>
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Connection details</p>
            <p className="mt-2 text-sm leading-6 text-muted">{status?.provider ? `Provider: ${status.provider}` : "No model provider is currently reported."}</p>
            <p className="mt-3 rounded-xl bg-soft px-3 py-2 text-xs font-medium text-muted">Status: {statusLabel}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

