import { useAuth } from "../../context/AuthContext";

export function DashboardNav() {
  const { user, signOut } = useAuth();

  return (
    <header className="flex justify-between items-center h-16 px-margin-desktop bg-surface/40 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-30">
      {/* Left — season tabs */}
      <div className="flex items-center gap-lg">
        {/* Mobile logo */}
        <span className="font-headline-md text-headline-md font-extrabold text-primary md:hidden">
          HARDWOOD
        </span>

        {/* Desktop tabs */}
        <div className="hidden md:flex gap-md font-body-md text-body-md text-on-surface-variant">
          <a href="#" className="text-primary border-b-2 border-primary pb-1">
            Season 2024
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Playoffs
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Draft Board
          </a>
        </div>
      </div>

      {/* Right — search, actions, user */}
      <div className="flex items-center gap-md">
        {/* Search */}
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-tertiary text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search entity..."
            className="w-48 bg-surface-container-low border border-surface-variant rounded-DEFAULT py-1 pl-8 pr-sm font-data-mono text-data-mono text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="text-tertiary hover:text-primary transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        {/* User avatar + email */}
        <div className="flex items-center gap-sm">
          <button className="text-tertiary hover:text-primary transition-colors">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
          <span className="hidden sm:block font-data-mono text-[11px] text-tertiary">
            {user?.email}
          </span>
        </div>

        {/* Export */}
        <button className="hidden sm:block border border-outline text-secondary font-label-caps text-label-caps px-sm py-1 rounded-DEFAULT hover:bg-secondary/10 transition-colors">
          Export Data
        </button>

        {/* Go Live */}
        <button className="bg-primary-container text-black font-label-caps text-label-caps px-sm py-1 rounded-DEFAULT hover:opacity-90 transition-opacity">
          Go Live
        </button>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="text-tertiary hover:text-primary transition-colors"
          title="Sign out"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  );
}