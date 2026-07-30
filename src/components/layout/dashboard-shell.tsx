import { LogOut } from "lucide-react";
import Link from "next/link";

import { logout } from "@/actions/auth";
import { getRoleLabel } from "@/lib/auth";
import type { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";

type DashboardShellProps = {
  profile: Profile;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function DashboardShell({
  profile,
  title,
  description,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Plataforma Educação
            </p>
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-600">{description}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{profile.nome}</p>
              <p className="text-xs text-slate-500">{getRoleLabel(profile.role)}</p>
            </div>
            <form action={logout}>
              <Button type="submit" variant="secondary" aria-label="Sair">
                <LogOut className="h-4 w-4 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {profile.role === "admin_sme" ? (
            <>
              <NavLink href="/admin">Visão geral</NavLink>
              <NavLink href="/admin/bi">BI / Indicadores</NavLink>
              <NavLink href="/admin/escolas">Escolas</NavLink>
              <NavLink href="/admin/calendario">Calendário</NavLink>
            </>
          ) : null}
          {profile.role === "gestor_escolar" ? (
            <>
              <NavLink href="/gestor">Visão geral</NavLink>
              <NavLink href="/gestor/alunos">Alunos</NavLink>
              <NavLink href="/gestor/turmas">Turmas</NavLink>
              <NavLink href="/gestor/atribuicoes">Atribuições</NavLink>
            </>
          ) : null}
          {profile.role === "professor" ? (
            <>
              <NavLink href="/professor">Minhas turmas</NavLink>
              <NavLink href="/professor/planos">Planos de aula</NavLink>
            </>
          ) : null}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}
