import { useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { ErrorAlert } from "../components/ErrorAlert";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { ProjectTabs } from "../components/ProjectTabs";
import { StatusBadge } from "../components/StatusBadge";
import { useEstimation, useRequestEstimation } from "../hooks/useEstimation";
import { useProject } from "../hooks/useProjects";
import { getErrorMessage } from "../utils/errors";
import { formatDateTime, toId } from "../utils/format";

export function EstimationResultsPage() {
  const { projectId } = useParams();
  const id = projectId ? toId(projectId) : undefined;
  const projectQuery = useProject(id);
  const estimationQuery = useEstimation(id);
  const requestEstimation = useRequestEstimation(id ?? "");
  const result = estimationQuery.data;
  const lines = result?.lines ?? [];
  const missing = result?.missing_data ?? [];
  const status = (result?.status ?? "unavailable").toLowerCase();
  const engineMissing = status === "unavailable" || status === "pending";

  return (
    <div>
      {projectQuery.isLoading ? (
        <LoadingState label="Loading project" />
      ) : projectQuery.isError || !projectQuery.data || !id ? (
        <ErrorAlert
          title="Project unavailable"
          message={getErrorMessage(
            projectQuery.error,
            "Masonry estimation needs a valid project.",
          )}
          onRetry={() => void projectQuery.refetch()}
        />
      ) : (
        <>
          <PageHeader
            eyebrow="Masonry estimation"
            title={`Masonry Estimation Results - ${projectQuery.data.name}`}
            description="Residential masonry takeoff for this project. Quantities and rates are shown only when an estimation engine returns them. This page never invents figures."
          />
          <ProjectTabs projectId={id} />

          {estimationQuery.isLoading ? (
            <LoadingState label="Checking estimation engine" />
          ) : estimationQuery.isError ? (
            <ErrorAlert
              title="Could not load estimation"
              message={getErrorMessage(
                estimationQuery.error,
                "GET /api/projects/{id}/estimation failed.",
              )}
              onRetry={() => void estimationQuery.refetch()}
            />
          ) : (
            <>
              <div className="mb-5 rounded-2xl border border-[#E9D8A2] bg-[#FFF3CD] px-4 py-3 text-sm text-warning-text">
                <p className="font-semibold">
                  {engineMissing
                    ? "Estimation engine unavailable"
                    : "Engine response"}
                </p>
                <p className="mt-1">
                  {result?.reason ||
                    "No masonry estimation engine is connected. AURABUILD will not fabricate quantities, rates, CIDA, or BSR numbers."}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge value={result?.status ?? "unavailable"} />
                  <StatusBadge
                    kind="verification"
                    value={result?.verification_status ?? "unverified"}
                  />
                  {result?.engine ? (
                    <span className="text-xs">Engine: {result.engine}</span>
                  ) : null}
                  {result?.requested_at ? (
                    <span className="text-xs">
                      Requested {formatDateTime(result.requested_at)}
                    </span>
                  ) : null}
                </div>
              </div>

              {missing.length > 0 ? (
                <div className="mb-5 rounded-2xl border border-line bg-soft px-4 py-3 text-sm">
                  <p className="font-semibold text-ink">Missing data</p>
                  <ul className="mt-2 list-disc pl-5 text-muted">
                    {missing.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Masonry Estimation Results
                    </p>
                    <p className="text-xs text-muted">
                      Line items appear only if the engine returns them. Empty
                      means unavailable — not a generated BOQ.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={requestEstimation.isPending}
                    onClick={() => requestEstimation.mutate()}
                  >
                    Request estimation
                  </Button>
                </div>
                {requestEstimation.isError ? (
                  <div className="px-4 py-3">
                    <ErrorAlert
                      title="Request failed"
                      message={getErrorMessage(
                        requestEstimation.error,
                        "POST /api/projects/{id}/estimation failed.",
                      )}
                    />
                  </div>
                ) : null}
                {lines.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-muted">
                    No quantity or rate lines. Human verification status remains{" "}
                    <strong>unverified</strong> until an engine and a reviewer
                    both exist.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[40rem] text-left text-sm">
                      <thead className="bg-soft text-xs uppercase tracking-wide text-muted">
                        <tr>
                          {["#", "Description", "Unit", "Qty", "Rate", "Amount"].map(
                            (heading) => (
                              <th key={heading} className="px-4 py-3 font-semibold">
                                {heading}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {lines.map((line, index) => (
                          <tr key={`${line.description}-${index}`} className="border-t border-line">
                            <td className="px-4 py-3 text-muted">{index + 1}</td>
                            <td className="px-4 py-3 text-ink">{line.description}</td>
                            <td className="px-4 py-3 text-muted">{line.unit || "—"}</td>
                            <td className="px-4 py-3 text-muted">
                              {line.quantity ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-muted">
                              {line.rate ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-muted">
                              {line.amount ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
