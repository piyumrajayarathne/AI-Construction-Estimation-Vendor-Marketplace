import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import type { DocumentOut } from "../types";
import {
  documentKindLabel,
  formatDateTime,
  getDocumentErrors,
  toId,
} from "../utils/format";
import { EmptyState } from "./EmptyState";
import { StatusBadge } from "./StatusBadge";

type DocumentListProps = {
  projectId: string;
  documents: DocumentOut[];
};

export function DocumentList({ projectId, documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-5 w-5" />}
        title="No documents yet"
        description="Upload drawings, specifications, existing BOQs, or other PDFs. Status moves from pending to processed, or failed if the parser cannot read the file."
      />
    );
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      {documents.map((doc) => {
        const errors = getDocumentErrors(doc);
        return (
          <li key={toId(doc.id)} className="px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link
                  to={`/projects/${projectId}/documents/${toId(doc.id)}`}
                  className="font-medium text-ink hover:text-secondary"
                >
                  {doc.file_name}
                </Link>
                <p className="mt-0.5 text-xs text-muted">
                  {documentKindLabel(doc.document_kind)} Â· {doc.file_type} Â·
                  uploaded {formatDateTime(doc.uploaded_at)}
                </p>
                {errors.length > 0 ? (
                  <p className="mt-1 text-xs text-danger">{errors.join(" Â· ")}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge
                  kind="verification"
                  value={doc.verification_status ?? "unverified"}
                />
                <StatusBadge kind="document" value={doc.status} />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}


