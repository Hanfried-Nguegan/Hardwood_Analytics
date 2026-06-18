import { useAuth } from "../context/AuthContext";
import { StatsTicker } from "../components/landing/StatsTicker";
import { RosterProjectionCard } from "../components/landing/RosterProjectionCard";
import { WinProbabilityCard } from "../components/landing/WinProbabilityCard";
import { TerminalLogCard } from "../components/landing/TerminalLogCard";
import Navbar from "../components/landing/Navbar";

export function LandingPage() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="bg-background text-on-surface antialiased overflow-x-hidden min-h-screen">
      <Navbar onLoginClick={signInWithGoogle} />
      <StatsTicker />

      <header className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden py-24">
        <div className="gradient-bg" />

        <div className="relative z-10 container mx-auto px-margin-desktop flex flex-col items-center text-center">
          <div className="fade-in-up max-w-4xl mx-auto flex flex-col items-center gap-md" style={{ animationPlayState: "running" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-data-mono text-[10px] text-primary tracking-widest uppercase">
                System Optimal • v4.2 Online
              </span>
            </div>

            <h1 className="font-display-lg text-display-lg md:text-[80px] font-extrabold text-on-surface leading-[0.95] tracking-tighter">
              THE TERMINAL FOR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ff9b59] drop-shadow-[0_0_20px_rgba(255,107,0,0.4)]">
                NBA INTELLIGENCE
              </span>
            </h1>

            <p className="font-body-lg text-body-lg text-tertiary font-light max-w-2xl mt-4">
              The Bloomberg Terminal for basketball. Analyze tracking data,
              simulate outcomes, and scout globally with unparalleled depth
              and speed. Built for front offices that win.
            </p>

            <div className="flex gap-md mt-8">
              <button
                onClick={signInWithGoogle}
                className="bg-primary-container text-black font-label-caps text-[13px] px-8 py-4 rounded-sm hover:bg-primary-container/90 transition-all shadow-[0_0_20px_rgba(255,107,0,0.5)]"
              >
                Access Terminal
              </button>
            </div>
          </div>

          <div
            className="w-full max-w-6xl mt-16 fade-in-up grid grid-cols-1 md:grid-cols-12 gap-sm relative"
            style={{ animationPlayState: "running", animationDelay: "200ms" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none h-full w-full" />
            <RosterProjectionCard />
            <WinProbabilityCard />
            <TerminalLogCard />
          </div>
        </div>
      </header>
    </div>
  );
}