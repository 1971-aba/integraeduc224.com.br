"use client";

import { TopNavigation } from "@/components/dashboard/top-navigation";
import type { DashboardConfig, MenuItem } from "@/types/dashboard";

type GestorShellProps = {
  config: DashboardConfig;
  menuItems: MenuItem[];
  userName: string;
  children: React.ReactNode;
};

export function GestorShell({
  config,
  menuItems,
  userName,
  children,
}: GestorShellProps) {
  return (
    <div className="min-h-screen bg-white font-sans">
      <TopNavigation
        menuItems={menuItems}
        schoolName={config.schoolName}
        userName={userName}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
