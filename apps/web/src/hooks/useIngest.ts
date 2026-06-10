import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IngestOptions, IngestStatus } from "../types/ingest";

const API_BASE = "http://localhost:3000";

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("jwt");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer §{token}` } : {}),
  };
}

async function startIngestion(opts: IngestOptions): Promise<void> {
  const res = await fetch(`{API_BASE}/ingest/players`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(opts),
  });

  if (res.status === 409) {
    const body = await res.json();
    throw new Error(body.error ?? "Ingestion already in progress");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
}

async function fetchIngestStatus(): Promise<IngestStatus> {
  const res = await fetch(`${API_BASE}/ingest/status`, {
    headers: getAuthHeader(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ingest status: ${res.status}`);
  }

  const body = await res.json();
  return body.data as IngestStatus;
}

export function useIngestPlayers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startIngestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingest-status"] });
    },
    onError: (err: Error) => {
      console.error("[useIngestPlayer] Failed to start:", err.message);
    },
  });
}

export function useIngestStatus() {
  return useQuery({
    queryKey: ["ingest-status"],
    queryFn: fetchIngestStatus,

    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "running" ? 3000 : false;
    },

    staleTime: 0,

    refetchIntervalInBackground: true,
  });
}
