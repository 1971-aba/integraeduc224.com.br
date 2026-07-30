"use client";

import { ChevronDown, ExternalLink, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { logout } from "@/actions/auth";
import { MobileNavDrawer } from "@/components/dashboard/mobile-nav-drawer";
import { NavDropdownPanel } from "@/components/dashboard/nav-dropdown-item";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/dashboard";

type NavMenuItemProps = {
  item: MenuItem;
};

/** Margem mínima entre o painel e a borda da janela. */
const PANEL_MARGIN = 8;

/** Tolerância ao sair do menu, para o painel não fechar em falsos movimentos. */
const CLOSE_DELAY_MS = 180;

export function NavMenuItem({ item }: NavMenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasChildren = Boolean(item.children?.length);

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openNow() {
    cancelClose();
    setIsOpen(true);
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS);
  }

  useEffect(() => cancelClose, []);

  // O painel abre alinhado à esquerda; quando as colunas passam da janela,
  // ele é deslocado para a esquerda até caber.
  useEffect(() => {
    if (!isOpen) {
      setShift(0);
      return;
    }

    function adjust() {
      const wrapper = wrapperRef.current;
      const panel = panelRef.current;
      if (!wrapper || !panel) return;

      const naturalLeft = wrapper.getBoundingClientRect().left;
      const overflow =
        naturalLeft + panel.offsetWidth - (window.innerWidth - PANEL_MARGIN);

      setShift(
        overflow > 0
          ? -Math.min(overflow, Math.max(0, naturalLeft - PANEL_MARGIN))
          : 0,
      );
    }

    adjust();

    const panel = panelRef.current;
    const observer = panel ? new ResizeObserver(adjust) : null;
    if (panel && observer) observer.observe(panel);
    window.addEventListener("resize", adjust);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", adjust);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!hasChildren) {
    return (
      <Link
        href={item.href ?? "#"}
        className="whitespace-nowrap px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={openNow}
      onMouseLeave={scheduleClose}
      className="relative flex items-stretch"
    >
      <span
        className={cn(
          "flex items-center whitespace-nowrap px-3 py-2 text-sm font-medium text-white",
          isOpen && "bg-white/10",
        )}
      >
        {item.label}
      </span>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Expandir ${item.label}`}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex items-center px-2 py-2 text-white transition-colors hover:bg-white/10",
          isOpen && "bg-white/10",
        )}
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-150",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen ? (
        <div
          ref={panelRef}
          style={{ transform: `translateX(${shift}px)` }}
          className="absolute left-0 top-full z-50 max-w-[calc(100vw-1rem)] overflow-x-auto rounded-md border border-slate-200 bg-white shadow-lg"
        >
          {item.children!.length > 0 ? (
            <NavDropdownPanel
              items={item.children!}
              onNavigate={() => setIsOpen(false)}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

type TopNavigationProps = {
  menuItems: MenuItem[];
  schoolName: string;
  userName?: string;
  externalLinkHref?: string;
};

export function TopNavigation({
  menuItems,
  schoolName,
  userName,
  externalLinkHref = "#",
}: TopNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="bg-[#1E7BB8] text-white shadow-sm">
        <div className="mx-auto flex items-center justify-between gap-3 px-4 py-2 sm:px-6 md:py-0">
          <div className="flex min-w-0 flex-1 items-center gap-2 md:flex-initial">
            <button
              type="button"
              className="rounded-md p-2 hover:bg-white/10 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <span className="truncate text-xs font-semibold uppercase tracking-wide md:hidden">
              {schoolName}
            </span>

            <nav className="hidden flex-wrap items-center md:flex">
              {menuItems.map((item) => (
                <NavMenuItem key={item.label} item={item} />
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 py-1 md:gap-3 md:py-2">
            {userName ? (
              <>
                <span className="hidden max-w-[120px] truncate text-xs text-white/90 sm:block md:max-w-[160px] lg:max-w-xs">
                  {userName}
                </span>
                <form action={logout} className="hidden md:block">
                  <Button
                    type="submit"
                    variant="secondary"
                    className="h-8 border-white/20 bg-white/10 px-2 text-white hover:bg-white/20"
                    aria-label="Sair"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </form>
                <form action={logout} className="md:hidden">
                  <Button
                    type="submit"
                    variant="secondary"
                    className="h-9 border-white/20 bg-white/10 px-2.5 text-white hover:bg-white/20"
                    aria-label="Sair"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </form>
              </>
            ) : null}

            <span className="hidden text-right text-xs font-semibold uppercase tracking-wide md:block lg:text-sm">
              {schoolName}
            </span>

            <a
              href={externalLinkHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir unidade escolar em nova aba"
              className="rounded p-1 transition-colors hover:bg-white/10"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        menuItems={menuItems}
        schoolName={schoolName}
        userName={userName}
      />
    </>
  );
}
