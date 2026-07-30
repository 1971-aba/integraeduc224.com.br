"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/dashboard";

type NavDropdownItemProps = {
  item: MenuItem;
  depth?: number;
};

export function NavDropdownItem({ item, depth = 0 }: NavDropdownItemProps) {
  const [open, setOpen] = useState(false);
  const hasChildren = Boolean(item.children?.length);

  if (!hasChildren) {
    return (
      <Link
        href={item.href ?? "#"}
        className="block whitespace-nowrap px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#1E7BB8]"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      className="group/sub relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between gap-6 whitespace-nowrap px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#1E7BB8]",
          depth === 0 && "min-w-[220px]",
        )}
      >
        <span>{item.label}</span>
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform",
            open && "rotate-90",
          )}
        />
      </button>

      <div
        className={cn(
          "absolute top-0 z-50 max-w-[min(100vw-1rem,20rem)] rounded-md border border-slate-200 bg-white py-1 shadow-lg transition-all duration-150",
          depth === 0 ? "left-full ml-0.5" : "left-full ml-0.5",
          open
            ? "visible opacity-100"
            : "invisible opacity-0",
          "group-hover/sub:visible group-hover/sub:opacity-100",
        )}
      >
        {item.children!.map((child) => (
          <NavDropdownItem key={child.label} item={child} depth={depth + 1} />
        ))}
      </div>
    </div>
  );
}
