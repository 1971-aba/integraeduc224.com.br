"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/dashboard";

function menuItemKey(item: MenuItem, index: number, prefix: string) {
  return `${prefix}-${index}-${item.href ?? item.label}`;
}

type NavDropdownPanelProps = {
  items: MenuItem[];
  depth?: number;
};

export function NavDropdownPanel({ items, depth = 0 }: NavDropdownPanelProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const prefix = `nav-depth-${depth}`;

  return (
    <div className="relative py-1" onMouseLeave={() => setOpenIndex(null)}>
      {items.map((item, index) => (
        <NavDropdownRow
          key={menuItemKey(item, index, prefix)}
          item={item}
          depth={depth}
          isOpen={openIndex === index}
          onOpen={() => setOpenIndex(index)}
        />
      ))}
    </div>
  );
}

type NavDropdownRowProps = {
  item: MenuItem;
  depth: number;
  isOpen: boolean;
  onOpen: () => void;
};

function NavDropdownRow({
  item,
  depth,
  isOpen,
  onOpen,
}: NavDropdownRowProps) {
  const hasChildren = Boolean(item.children?.length);

  if (!hasChildren) {
    return (
      <Link
        href={item.href ?? "#"}
        className="block whitespace-nowrap px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-[#E3F2FD] hover:text-[#1E7BB8]"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="relative" onMouseEnter={onOpen}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onOpen}
        className={cn(
          "flex w-full min-w-[200px] items-center justify-between gap-4 whitespace-nowrap px-4 py-2 text-left text-sm transition-colors",
          isOpen
            ? "bg-[#1E7BB8] text-white"
            : "text-slate-700 hover:bg-[#E3F2FD] hover:text-[#1E7BB8]",
        )}
      >
        <span>{item.label}</span>
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            isOpen ? "text-white/90" : "text-slate-400",
          )}
        />
      </button>

      {isOpen ? (
        <div
          className="absolute left-full top-0 ml-0.5 pl-1"
          style={{ zIndex: 50 + depth * 10 }}
        >
          <div className="min-w-[200px] rounded-md border border-slate-200 bg-white shadow-lg">
            <NavDropdownPanel items={item.children!} depth={depth + 1} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** @deprecated Use NavDropdownPanel for a list of siblings. */
export function NavDropdownItem({
  item,
  depth = 0,
}: {
  item: MenuItem;
  depth?: number;
}) {
  return <NavDropdownPanel items={[item]} depth={depth} />;
}
