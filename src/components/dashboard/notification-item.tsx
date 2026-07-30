"use client";

import { Info, UserRound, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DashboardNotification } from "@/types/dashboard";

type NotificationItemProps = {
  notification: DashboardNotification;
  onDismiss: (id: string) => void;
};

const yellowStyles = "bg-[#FFFDE7] text-[#5D4037]";
const blueStyles = "bg-[#E3F2FD] text-[#0D47A1]";

export function NotificationItem({
  notification,
  onDismiss,
}: NotificationItemProps) {
  const isYellow =
    notification.type === "birthday" ||
    notification.type === "alert" ||
    notification.type === "stats";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-md px-4 py-3 text-sm",
        isYellow ? yellowStyles : blueStyles,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {notification.type === "alert" ? (
          <UserRound
            className="h-4 w-4 shrink-0 text-[#1E7BB8]"
            aria-hidden="true"
          />
        ) : null}

        {notification.type === "stats" || notification.type === "birthday" ? (
          <Info
            className="h-4 w-4 shrink-0 text-[#1E7BB8]"
            aria-hidden="true"
          />
        ) : null}

        <p className="leading-snug">
          {notification.type === "stats" ? (
            <>
              <span className="font-medium">{notification.message}</span>
              {notification.highlight ? (
                <span className="ml-1 font-bold">{notification.highlight}</span>
              ) : null}
              {notification.detail ? (
                <span className="ml-1 font-normal">
                  ... {notification.detail}
                </span>
              ) : null}
            </>
          ) : (
            <>
              <span className="font-medium">{notification.message}</span>
              {notification.detail ? (
                <span className="ml-1 font-normal">({notification.detail})</span>
              ) : null}
            </>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(notification.id)}
        aria-label="Fechar notificação"
        className={cn(
          "shrink-0 rounded p-1 transition-colors hover:bg-black/5",
          isYellow ? "text-[#5D4037]" : "text-[#0D47A1]",
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
