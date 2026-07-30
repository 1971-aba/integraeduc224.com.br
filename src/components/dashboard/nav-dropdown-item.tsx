"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/dashboard";

function menuItemKey(item: MenuItem, index: number, prefix: string) {
  return `${prefix}-${index}-${item.href ?? item.label}`;
}

type NavDropdownPanelProps = {
  items: MenuItem[];
  onNavigate?: () => void;
};

export function NavDropdownPanel({ items, onNavigate }: NavDropdownPanelProps) {
  const [path, setPath] = useState<number[]>([]);

  const columns = useMemo(() => {
    const result: MenuItem[][] = [items];

    for (let depth = 0; depth < path.length; depth++) {
      const index = path[depth];
      const parent = result[depth]?.[index];
      if (!parent?.children?.length) break;
      result.push(parent.children);
    }

    return result;
  }, [items, path]);

  /** Abre a coluna do item apontado, descartando os níveis mais profundos. */
  function openItem(depth: number, index: number) {
    setPath((current) => [...current.slice(0, depth), index]);
  }

  /** Item sem filhos: fecha as colunas abertas a partir deste nível. */
  function closeDeeper(depth: number) {
    setPath((current) => current.slice(0, depth));
  }

  return (
    <div className="flex items-start">
      {columns.map((columnItems, depth) => (
        <div
          key={`column-${depth}`}
          className={cn(
            "min-w-[210px] shrink-0",
            depth > 0 && "border-l border-slate-200",
          )}
        >
          {columnItems.map((item, index) => {
            const isActive = path[depth] === index;
            const hasChildren = Boolean(item.children?.length);
            const prefix = `column-${depth}`;

            if (!hasChildren) {
              return (
                <Link
                  key={menuItemKey(item, index, prefix)}
                  href={item.href ?? "#"}
                  onMouseEnter={() => closeDeeper(depth)}
                  onFocus={() => closeDeeper(depth)}
                  onClick={onNavigate}
                  className="block border-b border-slate-100 px-4 py-2.5 text-sm font-medium text-[#1E7BB8] transition-colors last:border-b-0 hover:bg-[#E3F2FD]"
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <button
                key={menuItemKey(item, index, prefix)}
                type="button"
                aria-expanded={isActive}
                onMouseEnter={() => openItem(depth, index)}
                onFocus={() => openItem(depth, index)}
                onClick={() => openItem(depth, index)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 text-left text-sm font-medium transition-colors last:border-b-0",
                  isActive
                    ? "bg-[#1E7BB8] text-white"
                    : "text-[#1E7BB8] hover:bg-[#E3F2FD]",
                )}
              >
                <span>{item.label}</span>
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    isActive ? "text-white" : "text-slate-400",
                  )}
                />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** @deprecated Use NavDropdownPanel for a list of siblings. */
export function NavDropdownItem({ item }: { item: MenuItem; depth?: number }) {
  return <NavDropdownPanel items={[item]} />;
}
