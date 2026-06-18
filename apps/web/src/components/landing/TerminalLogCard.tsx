import { useEffect, useRef, useState } from "react";

const LOGS = [
  { text: "> Init synergy_data_v4...", status: "OK", statusClass: "text-green-500" },
  { text: "> Fetching tracking pos: [22, 14]", status: "", statusClass: "" },
  { text: "> WARN: Anomaly detected in USG%", status: "RECALIBRATING", statusClass: "text-primary" },
  { text: "> Matchup sim complete: 10,000 iter", status: "READY", statusClass: "text-secondary" },
  { text: "> Loading visualizer engine...", status: "OK", statusClass: "text-green-500" },
  { text: "> Syncing global draft intel database...", status: "", statusClass: "" },
  { text: "> Projections updated for class 2025", status: "SUCCESS", statusClass: "text-green-500" },
  { text: "> Running Monte Carlo trade scenario #491", status: "RUNNING", statusClass: "text-primary animate-pulse" },
  { text: "> Analytics node active: Seattle-1", status: "ONLINE", statusClass: "text-green-500" },
];

const MAX_VISIBLE_LOGS = 9;

interface LogLine {
  id: number;
  text: string;
  status: string;
  statusClass: string;
}

export function TerminalLogCard() {
  const [visibleLogs, setVisibleLogs] = useState<LogLine[]>([]);
  const logIndexRef = useRef(0);
  const idRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const addLog = () => {
      const log = LOGS[logIndexRef.current % LOGS.length];
      const newLine: LogLine = { id: idRef.current++, ...log };

      setVisibleLogs((prev) => {
        const next = [...prev, newLine];
        return next.length > MAX_VISIBLE_LOGS ? next.slice(1) : next;
      });

      logIndexRef.current++;

      const delay = Math.random() * 1000 + 800;
      timeoutId = setTimeout(addLog, delay);
    };

    timeoutId = setTimeout(addLog, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="col-span-12 md:col-span-3 glass-panel rounded-lg p-sm h-[320px] flex flex-col">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2 mb-3">
        <span className="font-label-caps text-[10px] text-tertiary">
          TERMINAL LOG
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-hidden font-data-mono text-[10px] text-tertiary flex flex-col gap-2 opacity-80"
      >
        {visibleLogs.map((log, i) => {
          const isLast = i === visibleLogs.length - 1;
          return (
            <div
              key={log.id}
              className="log-line font-data-mono text-[10px] text-tertiary opacity-80 active"
            >
              {log.text}
              {log.status && (
                <span className={`${log.statusClass} ml-1`}>{log.status}</span>
              )}
              {isLast && <span className="terminal-cursor" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}