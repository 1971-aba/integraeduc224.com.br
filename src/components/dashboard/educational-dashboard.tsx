"use client";

import { NotificationBoard } from "@/components/dashboard/notification-board";
import { TopNavigation } from "@/components/dashboard/top-navigation";
import {
  dashboardConfig,
  dashboardNotifications,
} from "@/data/dashboard-notifications";
import { dashboardMenuItems } from "@/data/dashboard-menu";
import type { DashboardConfig, DashboardNotification, MenuItem } from "@/types/dashboard";

type EducationalDashboardProps = {
  menuItems?: MenuItem[];
  config?: DashboardConfig;
  notifications?: DashboardNotification[];
};

export function EducationalDashboard({
  menuItems = dashboardMenuItems,
  config = dashboardConfig,
  notifications = dashboardNotifications,
}: EducationalDashboardProps) {
  return (
    <div className="min-h-screen bg-white font-sans">
      <TopNavigation
        menuItems={menuItems}
        schoolName={config.schoolName}
      />

      <main className="mx-auto px-4 py-10 sm:px-6">
        <NotificationBoard
          location={config.location}
          date={config.date}
          notifications={notifications}
        />
      </main>
    </div>
  );
}
