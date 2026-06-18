import { useEffect, useRef, useState } from "react";

const LAL_PROB = 38.4;
const DEN_PROB = 61.6;

function useAnimatedNumber(target: number, trigger: boolean, duration = 1500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (startTimestamp === null) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(parseFloat((eased * target).toFixed(1)));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [trigger, target, duration]);

  return value;
}

export function WinProbabilityCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setTriggered(true);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const lalValue = useAnimatedNumber(LAL_PROB, triggered);
  const denValue = useAnimatedNumber(DEN_PROB, triggered);

  return (
    <div
      ref={cardRef}
      id="win-probability-card"
      className="col-span-12 md:col-span-5 glass-panel rounded-lg p-sm h-[320px] flex flex-col border-primary/30"
    >
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[16px]">
            query_stats
          </span>
          <span className="font-label-caps text-[10px] text-tertiary">
            WIN PROBABILITY ENGINE
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-4">
        <div className="flex items-center justify-center gap-8 w-full">
          <div className="flex flex-col items-center gap-2 w-24">
            <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center">
              <span className="font-data-mono text-xs text-tertiary">LAL</span>
            </div>
            <span className="font-data-mono text-xl text-on-surface">LAL</span>
          </div>

          <div className="font-display-lg text-display-lg text-on-surface-variant font-black opacity-30">
            VS
          </div>

          <div className="flex flex-col items-center gap-2 w-24">
            <div className="w-24 h-24 rounded-full bg-primary-container/20 flex items-center justify-center relative z-10">
              <span className="font-data-mono text-xs text-primary">DEN</span>
            </div>
            <span className="font-data-mono text-xl text-primary font-bold">
              DEN
            </span>
          </div>
        </div>

        <div className="w-full px-4 mt-2">
          <div className="flex justify-between font-data-mono text-xs mb-1">
            <span className="text-on-surface-variant">{lalValue}%</span>
            <span className="text-primary font-bold">{denValue}%</span>
          </div>
          <div className="flex w-full h-2 rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 right-1/2 flex justify-end overflow-hidden">
              <div
                className={`bg-surface-container-high win-bar-left h-full ${
                  triggered ? "animate" : ""
                }`}
                style={{ width: "100%" }}
              />
            </div>
            <div className="absolute inset-y-0 left-1/2 right-0 flex justify-start overflow-hidden">
              <div
                className={`bg-primary-container win-bar-right h-full shadow-[0_0_10px_#ff6b00] ${
                  triggered ? "animate" : ""
                }`}
                style={{ width: "100%" }}
              />
            </div>
            <div className="w-[38.4%] bg-surface-container-high/20 h-full" />
            <div className="w-[61.6%] bg-primary-container/20 h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}