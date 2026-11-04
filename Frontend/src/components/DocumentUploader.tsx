import { useCallback, useState, type DragEvent, type ChangeEvent } from "react";
import { FileUp } from "lucide-react";
import { useUploadDocument } from "../hooks/useDocuments";
import type { DocumentKind } from "../types";
import { getErrorMessage } from "../utils/errors";
import { Button } from "./Button";
import { ErrorAlert } from "./ErrorAlert";
import { Field, SelectInput } from "./Field";

const MAX_BYTES = 25 * 1024 * 1024;

const KINDS: { id: DocumentKind; label: string; hint: string }[] = [
  { id: "drawing", label: "Drawing", hint: "Plans, elevations, details" },
  { id: "specification", label: "Specification", hint: "Written specs" },
  { id: "existing_boq", label: "Existing BOQ", hint: "Input only â€” not generated" },
  { id: "other", label: "Other PDF", hint: "Supporting PDF" },
];

type DocumentUploaderProps = {
  projectId: string;
};

function isPdf(file: File): boolean {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

export function DocumentUploader({ projectId }: DocumentUploaderProps) {
  const upload = useUploadDocument(projectId);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [kind, setKind] = useState<DocumentKind>("drawing");

  const submitFile = useCallback(
    (file: File) => {
      setLocalError(null);
      if (!isPdf(file)) {
        setLocalError("Only PDF drawings, specifications, and BOQs can be uploaded.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setLocalError("That file is larger than 25 MB. Choose a smaller PDF.");
        return;
      }
      upload.mutate({ file, documentKind: kind });
    },
    [kind, upload],
  );

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) submitFile(file);
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) submitFile(file);
    event.target.value = "";
  }

  return (
    <div className="space-y-3">
      <Field
        label="Document type"
        htmlFor="document_kind"
        hint="Existing BOQs are source inputs. AURABUILD does not generate a BOQ from them."
      >
        <SelectInput
          id="document_kind"
          value={kind}
          onChange={(event) => setKind(event.target.value as DocumentKind)}
        >
          {KINDS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label} â€” {option.hint}
            </option>
          ))}
        </SelectInput>
      </Field>
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
          isDragging
            ? "border-secondary bg-[#F0E9F8]"
            : "border-line bg-soft hover:border-secondary/55 hover:bg-white"
        }`}
      >
        <FileUp className="h-8 w-8 text-secondary" />
        <p className="mt-3 text-sm font-semibold text-ink">
          Drop a PDF here, or browse
        </p>
        <p className="mt-1 text-xs text-muted">
          Drawings, specifications, existing BOQs, and other PDFs. PDF only, up
          to 25 MB.
        </p>
        <input
          className="sr-only"
          type="file"
          accept="application/pdf,.pdf"
          onChange={onChange}
        />
        <Button className="mt-4 pointer-events-none" size="sm" variant="secondary">
          Choose PDF
        </Button>
      </label>
      {upload.isPending ? (
        <p className="rounded-xl border border-[#CDE5F4] bg-[#EAF4FB] px-4 py-3 text-sm font-medium text-information">Uploading documentâ€¦</p>
      ) : null}
      {localError ? <ErrorAlert title="Upload blocked" message={localError} /> : null}
      {upload.isError ? (
        <ErrorAlert
          title="Upload failed"
          message={getErrorMessage(
            upload.error,
            "The document could not be sent to the API.",
          )}
        />
      ) : null}
      {upload.isSuccess ? (
        <p className="rounded-xl border border-[#CFE6D6] bg-[#E8F5EE] px-4 py-3 text-sm font-semibold text-success">
          {upload.data.file_name} was accepted and is now {upload.data.status}.
        </p>
      ) : null}
    </div>
  );
}





