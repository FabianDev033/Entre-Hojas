import React from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "../Components/common";
import { DashboardStatsProvider } from "../contexts/DashboardStatsContext";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <aside>
        <Menu />
      </aside>

      <main className="flex-1">
        <DashboardStatsProvider>
          <Outlet />
        </DashboardStatsProvider>
      </main>
    </div>
  );
}
