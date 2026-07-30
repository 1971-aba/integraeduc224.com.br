"use client";

import Link from "next/link";
import { KeyRound, ShieldCheck, UserPlus, Users } from "lucide-react";

import { getRoleLabelSga } from "@/lib/sga-dashboard";
import type { UserRole } from "@/types/database";

export type SgaRecentUser = {
  id: string;
  nome: string;
  role: UserRole;
  ativo: boolean;
  createdAt: string;
};

export type SgaPerfilCount = {
  role: UserRole;
  count: number;
};

type SgaHomePanelProps = {
  totalUsuarios: number;
  usuariosAtivos: number;
  usuariosInativos: number;
  recentUsers: SgaRecentUser[];
  perfilCounts: SgaPerfilCount[];
};

export function SgaHomePanel({
  totalUsuarios,
  usuariosAtivos,
  usuariosInativos,
  recentUsers,
  perfilCounts,
}: SgaHomePanelProps) {
  return (
    <div className="mt-10 space-y-8">
      <section className="grid gap-4 sm:grid-cols-3">
        <ResumoCard
          icon={<Users className="h-5 w-5 text-[#1E7BB8]" />}
          label="Usuários cadastrados"
          value={String(totalUsuarios)}
        />
        <ResumoCard
          icon={<ShieldCheck className="h-5 w-5 text-[#1E7BB8]" />}
          label="Acessos ativos"
          value={String(usuariosAtivos)}
        />
        <ResumoCard
          icon={<KeyRound className="h-5 w-5 text-[#1E7BB8]" />}
          label="Usuários inativos"
          value={String(usuariosInativos)}
        />
      </section>

      {perfilCounts.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Acessos por perfil
          </h2>
          <div className="flex flex-wrap gap-2">
            {perfilCounts.map((item) => (
              <Link
                key={item.role}
                href={`/sga/usuarios?perfil=${item.role}`}
                className="rounded-full bg-[#E3F2FD] px-3 py-1 text-xs font-medium text-[#1565C0] hover:bg-[#BBDEFB]"
              >
                {getRoleLabelSga(item.role)}: {item.count}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Gestão centralizada de acessos
            </h2>
            <p className="text-sm text-slate-600">
              Cadastre logins e senhas de gestores, coordenadores, professores e
              demais perfis da rede
            </p>
          </div>
          <Link
            href="/sga/usuarios/novo"
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#4097B1] px-4 text-sm font-semibold text-white hover:bg-[#36899f]"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Cadastrar usuário
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <QuickLink
            href="/sga/usuarios"
            title="Listar usuários"
            description="Consulte, edite e gerencie todos os acessos da rede"
          />
          <QuickLink
            href="/sga/usuarios?status=inativo"
            title="Usuários inativos"
            description="Revise contas desativadas e restaure acessos quando necessário"
          />
          <QuickLink
            href="/sga/relatorios"
            title="Relatórios SGA"
            description="Acessos por perfil, log de cadastros e exportação CSV"
          />
          <QuickLink
            href="/sga/configuracoes"
            title="Política de senhas"
            description="Regras de complexidade e permissões do SGA"
          />
        </div>
      </section>

      {recentUsers.length > 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Últimos cadastros</h2>
              <p className="text-sm text-slate-600">
                Usuários adicionados recentemente à rede
              </p>
            </div>
            <Link
              href="/sga/usuarios"
              className="text-sm font-medium text-[#1E7BB8] hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentUsers.map((usuario) => (
              <li
                key={usuario.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-slate-900">{usuario.nome}</p>
                  <p className="text-sm text-slate-600">
                    {getRoleLabelSga(usuario.role)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      usuario.ativo
                        ? "rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                        : "rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                    }
                  >
                    {usuario.ativo ? "Ativo" : "Inativo"}
                  </span>
                  <Link
                    href={`/sga/usuarios/${usuario.id}`}
                    className="text-sm font-medium text-[#1E7BB8] hover:underline"
                  >
                    Editar
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function ResumoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#BBDEFB] bg-[#E3F2FD]/40 px-4 py-4">
      <div className="mb-2">{icon}</div>
      <p className="text-2xl font-bold text-[#0D47A1]">{value}</p>
      <p className="text-sm text-[#1565C0]">{label}</p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-[#BBDEFB] hover:bg-[#E3F2FD]/20"
    >
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </Link>
  );
}
