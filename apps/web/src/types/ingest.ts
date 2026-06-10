export interface IngestOptions {
    season?: string;
    delayMs?: number;
}

export interface IngestResut {
    teamsUpserted: number;
    playersUpserted: number;
    statsUpserted: number;
    errors: string[];
    durationMs: number;
}

export interface IngestStatus {
    status: "idle" | "running" | "done" | "failed";
    startedAt: number | null;
    elapsedMs: number | null;
    result: IngestResut | null;
    error: string | null;
}
