export interface NavItem {
  label: string;
  icon: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", path: "/dashboard" },
  { label: "Players", icon: "groups", path: "/dashboard/players" },
  { label: "Teams", icon: "shield", path: "/dashboard/teams" },
  { label: "Simulations", icon: "psychology", path: "/dashboard/simulations" },
  {
    label: "Comparisons",
    icon: "compare_arrows",
    path: "/dashboard/comparisons",
  },
  { label: "Games", icon: "sports_basketball", path: "/dashboard/games" },
  { label: "Analytics", icon: "monitoring", path: "/dashboard/analytics" },
  { label: "AI Assistant", icon: "smart_toy", path: "/dashboard/ai" },
];
