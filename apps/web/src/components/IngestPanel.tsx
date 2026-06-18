// WHY THIS FILE EXISTS:
// This is the UI for triggering and monitoring ingestion.
// It uses ONLY the two hooks — no fetch() calls, no state management here.
// The component's job is purely presentation.

import { useIngestPlayers, useIngestStatus } from "../hooks/useIngest";

export function IngestPanel() {
  const {
    mutate: startIngest,
    isPending,
    isError,
    error,
  } = useIngestPlayers();

  const { data: status } = useIngestStatus();

  const isRunning = status?.status === "running";
  const isDone = status?.status === "done";
  const isFailed = status?.status === "failed";

  // Disable the button while the POST is in flight OR while job is running
  const isDisabled = isPending || isRunning;

  return (
    <div style={{ padding: "24px", maxWidth: "600px" }}>
      <h2>NBA Data Sync</h2>
      <p style={{ color: "#666", marginBottom: "16px" }}>
        Fetches all active NBA players and their complete career stats.
        Takes ~5 minutes to complete.
      </p>

      {/* Trigger button */}
      <button
        onClick={() => startIngest({ season: "2024-25" })}
        disabled={isDisabled}
        style={{ marginBottom: "16px" }}
      >
        {isPending
          ? "Starting..."
          : isRunning
            ? "Ingestion running..."
            : "Sync All NBA Players"}
      </button>

      {/* Running state — show elapsed time */}
      {isRunning && status.elapsedMs !== null && (
        <div style={{ color: "#555" }}>
          <p>⏳ Running... {Math.round(status.elapsedMs / 1000)}s elapsed</p>
          <p style={{ fontSize: "13px", color: "#888" }}>
            Fetching career stats for all active players. This takes ~5 minutes.
          </p>
        </div>
      )}

      {/* Done state — show results */}
      {isDone && status.result && (
        <div style={{ background: "#000000", padding: "16px", borderRadius: "8px" }}>
          <p>✅ Done in {(status.result.durationMs / 1000).toFixed(1)}s</p>
          <p>🏀 {status.result.playersUpserted} players synced</p>
          <p>📊 {status.result.statsUpserted} stat rows upserted</p>
          <p>🏟️ {status.result.teamsUpserted} teams upserted</p>
          {status.result.errors.length > 0 && (
            <details style={{ marginTop: "8px" }}>
              <summary style={{ color: "#b45309", cursor: "pointer" }}>
                ⚠️ {status.result.errors.length} players had errors (click to expand)
              </summary>
              <ul style={{ fontSize: "12px", marginTop: "8px", color: "#666" }}>
                {status.result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {/* Failed state — show error */}
      {isFailed && (
        <div style={{ background: "#fef2f2", padding: "16px", borderRadius: "8px" }}>
          <p>❌ Ingestion failed: {status.error}</p>
        </div>
      )}

      {/* POST request error (e.g. already running, network error) */}
      {isError && (
        <div style={{ background: "#fef2f2", padding: "16px", borderRadius: "8px" }}>
          <p>❌ {error?.message}</p>
        </div>
      )}
    </div>
  );
}