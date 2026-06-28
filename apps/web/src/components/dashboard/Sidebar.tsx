import { NavLink } from "react-router-dom";
//import { useAuth } from "../../context/AuthContext";
import { NAV_ITEMS } from "./nav";

const Sidebar = () => {
  //const { signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface/40 backdrop-blur-xl border-r border-white/5 hidden md:flex flex-col py-md px-sm z-40">
      <div className="flex items-center gap-sm mb-lg px-sm">
        <img
          src="/logo.png"
          alt="HARDWOOD"
          className="w-8 h-8 rounded-sm object-contain"
        />
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">
            HARDWOOD
          </h1>
          <span className="font-label-caps text-label-caps text-tertiary">
            Elite Terminal
          </span>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-xs overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              [
                "flex items-center gap-sm px-md py-sm rounded-DEFAULT transition-all duration-200 ease-in-out",
                isActive
                  ? "text-primary font-bold border-r-2 border-primary bg-primary/5"
                  : "text-tertiary hover:text-on-surface hover:bg-surface-container-highest/50",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span className="font-label-caps text-label-caps">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            [
              "flex items-center gap-sm px-md py-sm rounded-DEFAULT transition-all duration-200 ease-in-out mt-auto",
              isActive
                ? "text-primary font-bold border-r-2 border-primary bg-primary/5"
                : "text-tertiary hover:text-on-surface hover:bg-surface-container-highest/50",
            ].join(" ")
          }
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-caps text-label-caps">Settings</span>
        </NavLink>
      </nav>

      <div className="mt-md">
        <button className="w-full bg-primary-container text-black font-label-caps text-label-caps py-sm rounded-DEFAULT hover:opacity-90 transition-opacity">
          Run Simulation
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
