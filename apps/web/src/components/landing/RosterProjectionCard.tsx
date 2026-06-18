const roster = [
  { name: "Tatum, J.", overall: 98.2 },
  { name: "Brown, J.", overall: 94.5 },
  { name: "Porzingis, K.", overall: 89.1 },
];

export function RosterProjectionCard() {
  return (
    <div className="col-span-12 md:col-span-4 glass-panel rounded-lg p-sm h-[320px] flex flex-col">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-secondary-container" />
          <span className="font-label-caps text-[10px] text-tertiary">
            ROSTER PROJ
          </span>
        </div>
        <span className="font-data-mono text-[10px] text-primary">LIVE</span>
      </div>

      <div className="flex-1 overflow-hidden">
        {roster.map((player) => (
          <div key={player.name}>
            <div className="font-data-mono text-xs text-on-surface mb-2 flex justify-between">
              <span>{player.name}</span>
              <span className="text-secondary">{player.overall} OVR</span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mb-4">
              <div
                className="bg-secondary h-1.5 rounded-full"
                style={{ width: `${player.overall}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}