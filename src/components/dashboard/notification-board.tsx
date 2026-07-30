"use client";

import { useMemo, useState } from "react";

import { NotificationItem } from "@/components/dashboard/notification-item";
import type { DashboardNotification } from "@/types/dashboard";

type NotificationBoardProps = {
  title?: string;
  location: string;
  date: string;
  notifications: DashboardNotification[];
};

export function NotificationBoard({
  title = "Quadro de Notificações",
  location,
  date,
  notifications,
}: NotificationBoardProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const visibleNotifications = useMemo(
    () => notifications.filter((n) => !dismissedIds.includes(n.id)),
    [notifications, dismissedIds],
  );

  function handleDismiss(id: string) {
    setDismissedIds((prev) => [...prev, id]);
  }

  return (
    <section className="mx-auto w-full max-w-4xl overflow-hidden rounded-lg border border-[#BBDEFB] bg-white shadow-sm">
      <div className="flex flex-col gap-1 border-b border-[#BBDEFB] bg-[#E3F2FD] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-[#0D47A1]">{title}</h2>
        <p className="text-sm text-[#1565C0]">
          {location}, {date}
        </p>
      </div>

      <div className="space-y-2 p-4">
        {visibleNotifications.length > 0 ? (
          visibleNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDismiss={handleDismiss}
            />
          ))
        ) : (
          <p className="rounded-md bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Nenhuma notificação no momento.
          </p>
        )}
      </div>
    </section>
  );
}
