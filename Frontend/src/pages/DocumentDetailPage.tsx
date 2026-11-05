import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { FileWarning } from "lucide-react";
import { ErrorAlert } from "../components/ErrorAlert";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useDocument, useDocumentChunks } from "../hooks/useDocuments";
import { getErrorMessage } from "../utils/errors";
import {
  documentKindLabel,
  formatConfidence,
  formatDateTime,
  getDocumentErrors,
  readConfidence,
  toId,
} from "../utils/format";

export function DocumentDetailPage() {
  const { projectId, docId } = useParams();
  const pid = projectId ? toId(projectId) : undefined;
  const did = docId ? toId(docId) : undefined;
  const documentQuery = useDocument(pid, did);
  const doc = documentQuery.data;
  const isProcessed = doc?.status === "processed";
  const chunksQuery = useDocumentChunks(pid, did, Boolean(isProcessed));
  const errors = doc ? getDocumentErrors(doc) : [];
  return (
    <div>
      {documentQuery.isLoading ? (
        <LoadingState label="Loading document" />
      ) : documentQuery.isError || !doc || !pid ? (
        <ErrorAlert
          title="Document unavailable"
          message={getErrorMessage(
            documentQuery.error,
            "GET /api/projects/{id}/documents/{doc_id} failed.",
          )}
          onRetry={() => void documentQuery.refetch()}
        />
      ) : (
        <>
          <PageHeader
            eyebrow="Document"
            title={doc.file_name}
            description="Processed output is shown as page chunks returned by the API. Confidence appears only when a chunk includes it in metadata."
          />
          <p className="mb-6 text-sm">
            <Link
              to={`/projects/${pid}/documents`}
              className="font-medium text-secondary hover:underline"
            >
              Back to documents
            </Link>
          </p>
          <dl className="mb-6 grid gap-3 rounded-2xl border border-line bg-surface shadow-card p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Kind" value={documentKindLabel(doc.document_kind)} />
            <Info
              label="Status"
              value={<StatusBadge kind="document" value={doc.status} />}
            />
            <Info
              label="Verification"
              value={
                <StatusBadge
                  kind="verification"
                  value={doc.verification_status ?? "unverified"}
                />
              }
            />
            <Info label="Uploaded" value={formatDateTime(doc.uploaded_at)} />
            <Info label="File type" value={doc.file_type || "-"} />
            <Info
              label="Pages"
              value={doc.page_count != null ? String(doc.page_count) : "—"}
            />
            <Info
              label="Document ID"
              value={<span className="font-mono text-xs">{toId(doc.id)}</span>}
            />
          </dl>
          {doc.document_kind === "existing_boq" ? (
            <div className="mb-6 rounded-2xl border border-line bg-soft px-4 py-3 text-sm text-ink">
              This file is an <strong>existing BOQ</strong> uploaded as an input.
              AURABUILD does not generate a BOQ from it.
            </div>
          ) : null}
          {errors.length > 0 ? (
            <div className="mb-6">
              <ErrorAlert
                title="Processing reported errors"
                message={errors.join(" ")}
              />
            </div>
          ) : null}
          {doc.status === "pending" || doc.status === "processing" ? (
            <div className="rounded-2xl border border-[#BFD9EE] bg-[#EAF4FB] px-4 py-6 text-sm text-information">
              <LoadingState
                className="py-0"
                label={
                  doc.status === "pending"
                    ? "Queued for processing"
                    : "Extracting text from the PDF"
                }
              />
              <p className="mt-2 text-center text-xs text-information">
                This page refreshes automatically until status is processed or
                failed.
              </p>
            </div>
          ) : null}
          {doc.status === "failed" && errors.length === 0 ? (
            <div className="rounded-2xl border border-[#F1C0C0] bg-[#FBE9E9] px-4 py-6 text-sm text-danger">
              <div className="flex items-center gap-2 font-semibold">
                <FileWarning className="h-4 w-4" />
                Processing failed
              </div>
              <p className="mt-1">
                The API marked this file as failed and did not send an error
                message.
              </p>
            </div>
          ) : null}
          {isProcessed ? (
            chunksQuery.isLoading ? (
              <LoadingState label="Loading extracted chunks" />
            ) : chunksQuery.isError ? (
              <ErrorAlert
                title="Could not load extracted text"
                message={getErrorMessage(
                  chunksQuery.error,
                  "GET /api/projects/{id}/documents/{doc_id}/chunks failed.",
                )}
                onRetry={() => void chunksQuery.refetch()}
              />
            ) : (chunksQuery.data ?? []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-surface px-4 py-10 text-center text-sm text-muted">
                The document is processed, but no chunks were returned. Missing
                text is flagged rather than invented.
              </div>
            ) : (
              <ul className="space-y-3">
                {(chunksQuery.data ?? [])
                  .slice()
                  .sort((a, b) => a.chunk_index - b.chunk_index)
                  .map((chunk) => {
                    const confidence = readConfidence(chunk.metadata ?? null);
                    const page =
                      chunk.metadata &&
                      typeof chunk.metadata.page_number === "number"
                        ? chunk.metadata.page_number
                        : null;
                    return (
                      <li
                        key={toId(chunk.id)}
                        className="rounded-2xl border border-line bg-surface shadow-card p-4"
                      >
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                          <span className="font-semibold text-ink">
                            Chunk {chunk.chunk_index}
                            {page != null ? `· Page ${page}` : ""}
                          </span>
                          {confidence != null ? (
                            <span className="rounded-full bg-[#F0E9F8] px-2 py-0.5 font-medium text-secondary">
                              Confidence {formatConfidence(confidence)}
                            </span>
                          ) : null}
                          {chunk.has_embedding ? (
                            <span className="rounded-full bg-soft px-2 py-0.5">
                              Embedding present
                            </span>
                          ) : (
                            <span className="rounded-full bg-soft px-2 py-0.5">
                              No embedding
                            </span>
                          )}
                        </div>
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-ink">
                          {chunk.content || "—"}
                        </pre>
                      </li>
                    );
                  })}
              </ul>
            )
          ) : null}
        </>
      )}
    </div>
  );
}
function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-ink">{value}</dd>
    </div>
  );
}
