export function toId(value: string | number): string {
  return String(value);
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatNumber(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    value,
  );
}

export function titleCase(value?: string | null): string {
  if (!value) return "—";
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function readConfidence(
  metadata?: Record<string, unknown> | null,
): number | null {
  if (!metadata) return null;
  const raw = metadata.confidence ?? metadata.confidence_score;
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  return raw;
}

export function formatConfidence(value: number): string {
  if (value >= 0 && value <= 1) {
    return `${Math.round(value * 100)}%`;
  }
  return `${Math.round(value)}%`;
}

function pushErrorValue(bucket: string[], value: unknown): void {
  if (!value) return;
  if (typeof value === "string") {
    bucket.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) pushErrorValue(bucket, item);
    return;
  }
  if (typeof value === "object" && "msg" in value) {
    pushErrorValue(bucket, (value as { msg: unknown }).msg);
  }
}

export function getDocumentErrors(doc: {
  error?: unknown;
  error_message?: unknown;
  errors?: unknown;
  parse_metadata?: Record<string, unknown> | null;
}): string[] {
  const found: string[] = [];
  pushErrorValue(found, doc.error);
  pushErrorValue(found, doc.error_message);
  pushErrorValue(found, doc.errors);
  const meta = doc.parse_metadata;
  if (meta) {
    pushErrorValue(found, meta.error);
    pushErrorValue(found, meta.error_message);
    pushErrorValue(found, meta.errors);
  }
  return [...new Set(found.filter((item) => item.trim().length > 0))];
}

export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items as T[];
    if (Array.isArray(record.data)) return record.data as T[];
    if (Array.isArray(record.results)) return record.results as T[];
    if (Array.isArray(record.chunks)) return record.chunks as T[];
    if (Array.isArray(record.documents)) return record.documents as T[];
    if (Array.isArray(record.projects)) return record.projects as T[];
    if (Array.isArray(record.events)) return record.events as T[];
    if (Array.isArray(record.lines)) return record.lines as T[];
  }
  return [];
}

export function documentKindLabel(kind?: string | null): string {
  switch (kind) {
    case "drawing":
      return "Drawing";
    case "specification":
      return "Specification";
    case "existing_boq":
      return "Existing BOQ (input)";
    case "other":
      return "PDF";
    default:
      return kind ? titleCase(kind) : "PDF";
  }
}
