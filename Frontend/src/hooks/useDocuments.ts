import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDocument,
  getDocumentChunks,
  listDocuments,
  uploadDocument,
} from "../services/documents";
import type { DocumentKind } from "../types";

function isBusyStatus(status?: string): boolean {
  return status === "pending" || status === "processing";
}

export function useProjectDocuments(projectId: string | undefined) {
  return useQuery({
    queryKey: ["projects", projectId, "documents"],
    queryFn: () => listDocuments(projectId!),
    enabled: Boolean(projectId),
    refetchInterval: (query) => {
      const docs = query.state.data ?? [];
      return docs.some((doc) => isBusyStatus(doc.status)) ? 2500 : false;
    },
  });
}

export function useDocument(
  projectId: string | undefined,
  docId: string | undefined,
) {
  return useQuery({
    queryKey: ["projects", projectId, "documents", docId],
    queryFn: () => getDocument(projectId!, docId!),
    enabled: Boolean(projectId && docId),
    refetchInterval: (query) =>
      isBusyStatus(query.state.data?.status) ? 2000 : false,
  });
}

export function useDocumentChunks(
  projectId: string | undefined,
  docId: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["projects", projectId, "documents", docId, "chunks"],
    queryFn: () => getDocumentChunks(projectId!, docId!),
    enabled: Boolean(projectId && docId && enabled),
  });
}

export function useUploadDocument(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      documentKind,
    }: {
      file: File;
      documentKind: DocumentKind;
    }) => uploadDocument(projectId, file, documentKind),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "documents"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "activity"],
      });
    },
  });
}
