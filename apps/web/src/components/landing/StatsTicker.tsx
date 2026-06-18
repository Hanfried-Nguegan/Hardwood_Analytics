const tickerStats = [
  { name: "DONCIC, L", stat: "PER: 31.4", color: "orange" },
  { name: "JOKIC, N", stat: "WS/48: .311", color: "orange" },
  { name: "ANTETOKOUNMPO", stat: "USG%: 32.8", color: "orange" },
  { name: "EMBIID, J", stat: "BPM: 11.2", color: "orange" },
  { name: "GILGEOUS-ALEXANDER", stat: "TS%: .636", color: "blue" },
  { name: "TATUM, J", stat: "VORP: 4.8", color: "blue" },
  { name: "BRUNSON, J", stat: "PER: 24.1", color: "orange" },
  { name: "HALIBURTON, T", stat: "AST%: 45.2", color: "blue" },
];

function TickerItems() {
    return (
        <>
        {tickerStats.map((item, i) => (
            <div key={i} className="ticker-item">
                {item.name}{" "}
                <span className={item.color === "blue" ? "ticker-blue" : "ticker-val"}>
                {item.stat}
                </span>
            </div>
        ))}
        </>
    )
}

export function StatsTicker() {
    return (
        <div className="ticker-wrap relative z-40">
            <div className="ticker">
                <TickerItems/>
                <TickerItems/>
                <TickerItems/>
            </div>
        </div>
    )
}