"use client";

import { ChevronDown, LogOut, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/dashboard";

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  schoolName: string;
  userName?: string;
};

export function MobileNavDrawer({
  open,
  onClose,
  menuItems,
  schoolName,
  userName,
}: MobileNavDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-label="Fechar menu"
      />

      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-4">
          <div className="min-w-0 pr-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#1E7BB8]">
              {schoolName}
            </p>
            {userName ? (
              <p className="mt-1 truncate text-sm text-slate-600">{userName}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <MobileNavAccordion items={menuItems} onNavigate={onClose} />
        </nav>

        {userName ? (
          <div className="border-t border-slate-200 p-4">
            <form action={logout}>
              <Button type="submit" variant="secondary" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </form>
          </div>
        ) : null}
      </aside>
    </>
  );
}

function MobileNavAccordion({
  items,
  onNavigate,
  depth = 0,
}: {
  items: MenuItem[];
  onNavigate: () => void;
  depth?: number;
}) {
  return (
    <ul className="space-y-1">
      {items.map((item, index) => (
        <MobileNavItem
          key={`${depth}-${index}-${item.href ?? item.label}`}
          item={item}
          onNavigate={onNavigate}
          depth={depth}
        />
      ))}
    </ul>
  );
}

function MobileNavItem({
  item,
  onNavigate,
  depth,
}: {
  item: MenuItem;
  onNavigate: () => void;
  depth: number;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = Boolean(item.children?.length);

  if (!hasChildren) {
    return (
      <li>
        <Link
          href={item.href ?? "#"}
          onClick={onNavigate}
          className={cn(
            "block rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#1E7BB8]",
            depth > 0 && "pl-6",
          )}
        >
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50",
          depth > 0 && "pl-6",
        )}
        aria-expanded={open}
      >
        <span>{item.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div className="mt-1 border-l border-slate-200 pl-2">
          <MobileNavAccordion
            items={item.children!}
            onNavigate={onNavigate}
            depth={depth + 1}
          />
        </div>
      ) : null}
    </li>
  );
}
