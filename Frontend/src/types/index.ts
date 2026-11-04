export type UserRole = "customer" | "vendor" | "admin";

export type User = {
  id: string | number;
  email: string;
  full_name: string;
  role: UserRole | string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type?: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  full_name: string;
  role: "customer" | "vendor";
};

export type ProjectStatus =
  | "draft"
  | "analyzing"
  | "estimated"
  | "sourcing"
  | "quoted"
  | "closed";

export type Project = {
  id: string | number;
  name: string;
  description?: string | null;
  location?: string | null;
  budget_cap?: number | null;
  status?: ProjectStatus | string | null;
  owner_id?: string | number | null;
  created_at?: string | null;
  updated_at?: string | null;
  document_count?: number | null;
};

export type ProjectCreatePayload = {
  name: string;
  description?: string;
  location?: string;
  budget_cap?: number | null;
};

export type ProjectPatchPayload = {
  name?: string;
  description?: string;
  location?: string;
  budget_cap?: number | null;
  status?: string;
};

export type DocumentStatus = "pending" | "processing" | "processed" | "failed";

export type DocumentKind =
  | "drawing"
  | "specification"
  | "existing_boq"
  | "other";

export type VerificationStatus = "unverified" | "needs_review" | "verified";

export type DocumentOut = {
  id: string | number;
  project_id?: string | number | null;
  file_name: string;
  file_type: string;
  status: DocumentStatus | string;
  uploaded_at: string;
  document_kind?: DocumentKind | string | null;
  verification_status?: VerificationStatus | string | null;
  page_count?: number | null;
  error?: string | null;
  error_message?: string | null;
  errors?: unknown;
  parse_metadata?: Record<string, unknown> | null;
};

export type DocumentChunk = {
  id: string | number;
  chunk_index: number;
  content: string;
  metadata?: Record<string, unknown> | null;
  has_embedding?: boolean | null;
};

export type ActivityEvent = {
  id: string | number;
  project_id?: string | number | null;
  event_type: string;
  message: string;
  created_at: string;
  actor_email?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type EstimationLine = {
  description: string;
  unit?: string | null;
  quantity?: number | null;
  rate?: number | null;
  amount?: number | null;
};

export type EstimationResult = {
  status: "pending" | "unavailable" | "ready" | string;
  engine?: string | null;
  reason?: string | null;
  lines: EstimationLine[];
  missing_data?: string[];
  verification_status?: VerificationStatus | string | null;
  requested_at?: string | null;
};

export type AiStatus = {
  connected: boolean;
  provider?: string | null;
  message: string;
};

export type ApiErrorBody = {
  detail?: unknown;
  message?: unknown;
  error?: unknown;
};
