"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "chamada", label: "Chamada" },
  { href: "notas", label: "Notas" },
  { href: "conteudo", label: "Conteúdo" },
] as const;

type DiarioTabsProps = {
  atribuicaoId: string;
};

export function DiarioTabs({ atribuicaoId }: DiarioTabsProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] sm:static sm:mb-6 sm:border-0 sm:bg-transparent sm:pb-0"
      aria-label="Seções do diário"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-1 px-2 py-2 sm:flex sm:gap-2 sm:px-0">
        {tabs.map((tab) => {
          const href = `/professor/turma/${atribuicaoId}/${tab.href}`;
          const isActive = pathname.endsWith(`/${tab.href}`);
          return (
            <Link
              key={tab.href}
              href={href}
              className={cn(
                "flex h-12 items-center justify-center rounded-xl text-sm font-medium transition-colors sm:h-10 sm:px-4",
                isActive
                  ? "bg-blue-700 text-white"
                  : "text-slate-600 hover:bg-slate-100",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
