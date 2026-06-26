import { DashboardNav } from "./DashboardNav";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />

      <div className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-hidden">
        <DashboardNav />

        <main className="flex-1 overflow-y-auto p-gutter sm:p-margin-desktop">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
