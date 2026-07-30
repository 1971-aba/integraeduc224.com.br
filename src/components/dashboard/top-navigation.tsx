"use client";

import { ChevronDown, ExternalLink, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { logout } from "@/actions/auth";
import { MobileNavDrawer } from "@/components/dashboard/mobile-nav-drawer";
import { NavDropdownItem } from "@/components/dashboard/nav-dropdown-item";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/dashboard";

type NavMenuItemProps = {
  item: MenuItem;
};

export function NavMenuItem({ item }: NavMenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = Boolean(item.children?.length);

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
      className="group relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-1 whitespace-nowrap px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10",
          isOpen && "bg-white/10",
        )}
      >
        {item.label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-150",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "absolute left-0 top-full z-50 max-w-[min(100vw-1rem,20rem)] rounded-md border border-slate-200 bg-white py-1 shadow-lg transition-all duration-150",
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0",
          "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
        )}
      >
        {item.children!.map((child) => (
          <NavDropdownItem key={child.label} item={child} />
        ))}
      </div>
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
