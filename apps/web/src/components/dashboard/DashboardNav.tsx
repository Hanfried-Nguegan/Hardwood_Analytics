import { useAuth } from "../../context/AuthContext";

export function DashboardNav() {
  const { user, signOut } = useAuth();

  return (
    <header className="flex justify-between items-center h-16 px-margin-desktop bg-surface/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30">
      {/* Left — season tabs */}
      <div className="flex items-center gap-lg">
        <span className="font-headline-md text-headline-md font-extrabold text-primary md:hidden">
          HARDWOOD
        </span>
        {/* <div className="hidden md:flex gap-md font-body-md text-body-md text-on-surface-variant">
          <a href="#" className="text-primary border-b-2 border-primary pb-1">
            Season 2024
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Playoffs
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Draft Board
          </a>
        </div> */}
      </div>

      {/* Right — actions + user */}
      <div className="flex items-center gap-md">
        {/* Search */}
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-tertiary text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search entity..."
            className="w-full bg-surface-container-low border border-surface-variant rounded-DEFAULT py-1 pl-8 pr-sm font-data-mono text-data-mono text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="text-tertiary hover:text-primary transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        {/* Export */}
        <button className="hidden sm:block border border-outline text-secondary font-label-caps text-label-caps px-sm py-1 rounded-DEFAULT hover:bg-secondary/10 transition-colors">
          Export Data
        </button>

        {/* Go Live */}
        <button className="bg-primary-container text-black font-label-caps text-label-caps px-sm py-1 rounded-DEFAULT hover:opacity-90 transition-opacity">
          Go Live
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-outline-variant/30" />

        {/* User section — avatar + email + sign out */}
        <div className="flex items-center gap-sm">
          {/* Avatar */}
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username ?? user.email}
              className="w-8 h-8 rounded-full object-cover border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer flex-shrink-0"
              onError={(e) => {
                // If Google CDN fails, fall through to initials
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            // Initials fallback
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0 cursor-pointer">
              <span className="font-label-caps text-[11px] text-black font-bold">
                {user?.email?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
          )}

          {/* Email */}
          <span className="hidden sm:block font-data-mono text-[11px] text-tertiary max-w-[140px] truncate">
            {user?.email}
          </span>

          {/* Sign out */}
          <button
            onClick={signOut}
            title="Sign out"
            className="text-tertiary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}