import type { DocumentChunk, DocumentKind, DocumentOut } from "../types";
import { unwrapList } from "../utils/format";
import { apiFetch } from "./api";

export async function listDocuments(projectId: string): Promise<DocumentOut[]> {
  const data = await apiFetch<unknown>(`/api/projects/${projectId}/documents`);
  return unwrapList<DocumentOut>(data);
}

export function getDocument(
  projectId: string,
  docId: string,
): Promise<DocumentOut> {
  return apiFetch<DocumentOut>(
    `/api/projects/${projectId}/documents/${docId}`,
  );
}

export function uploadDocument(
  projectId: string,
  file: File,
  documentKind: DocumentKind = "other",
): Promise<DocumentOut> {
  const body = new FormData();
  body.append("file", file);
  body.append("document_kind", documentKind);
  return apiFetch<DocumentOut>(`/api/projects/${projectId}/documents`, {
    method: "POST",
    body,
  });
}

export async function getDocumentChunks(
  projectId: string,
  docId: string,
): Promise<DocumentChunk[]> {
  const data = await apiFetch<unknown>(
    `/api/projects/${projectId}/documents/${docId}/chunks`,
  );
  const list = unwrapList<DocumentChunk>(data);
  if (list.length) return list;
  if (data && typeof data === "object" && "content" in data) {
    return [data as DocumentChunk];
  }
  return [];
}
