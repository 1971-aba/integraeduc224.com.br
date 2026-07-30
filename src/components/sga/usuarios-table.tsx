"use client";

import Link from "next/link";
import { Loader2, Pencil, Power } from "lucide-react";
import { useTransition } from "react";

import { toggleSgaUsuarioAtivo } from "@/actions/sga-usuarios";
import { getRoleLabelSga } from "@/lib/sga-dashboard";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/database";

export type UsuarioListItem = {
  id: string;
  nome: string;
  email: string;
  cpf: string | null;
  role: UserRole;
  escola_id: string | null;
  ativo: boolean;
  created_at: string;
};

type UsuariosTableProps = {
  usuarios: UsuarioListItem[];
  escolaNomes: Record<string, string>;
  adminAvailable: boolean;
};

export function UsuariosTable({
  usuarios,
  escolaNomes,
  adminAvailable,
}: UsuariosTableProps) {
  if (usuarios.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
        <p className="font-medium text-slate-800">Nenhum usuário encontrado</p>
        <p className="mt-2 text-sm text-slate-600">
          Cadastre o primeiro acesso pelo botão &quot;Cadastrar usuário&quot;.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-[#E3F2FD]/50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Nome
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                CPF / E-mail
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Perfil
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Escola
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Status
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.map((usuario) => (
              <UsuarioTableRow
                key={usuario.id}
                usuario={usuario}
                escolaNomes={escolaNomes}
                adminAvailable={adminAvailable}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {usuarios.map((usuario) => (
          <UsuarioMobileCard
            key={usuario.id}
            usuario={usuario}
            escolaNomes={escolaNomes}
            adminAvailable={adminAvailable}
          />
        ))}
      </ul>
    </>
  );
}

function UsuarioTableRow({
  usuario,
  escolaNomes,
  adminAvailable,
}: {
  usuario: UsuarioListItem;
  escolaNomes: Record<string, string>;
  adminAvailable: boolean;
}) {
  return (
    <tr className="hover:bg-slate-50/80">
      <td className="px-4 py-3 font-medium text-slate-900">{usuario.nome}</td>
      <td className="px-4 py-3 text-slate-600">
        <div>{usuario.cpf ?? "—"}</div>
        <div className="text-xs text-slate-500">{usuario.email}</div>
      </td>
      <td className="px-4 py-3 text-slate-700">
        {getRoleLabelSga(usuario.role)}
      </td>
      <td className="px-4 py-3 text-slate-600">
        {usuario.escola_id
          ? (escolaNomes[usuario.escola_id] ?? "—")
          : "Secretaria"}
      </td>
      <td className="px-4 py-3">
        <StatusBadge ativo={usuario.ativo} />
      </td>
      <td className="px-4 py-3">
        <UsuarioActions
          usuario={usuario}
          adminAvailable={adminAvailable}
        />
      </td>
    </tr>
  );
}

function UsuarioMobileCard({
  usuario,
  escolaNomes,
  adminAvailable,
}: {
  usuario: UsuarioListItem;
  escolaNomes: Record<string, string>;
  adminAvailable: boolean;
}) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{usuario.nome}</p>
          <p className="mt-1 text-sm text-slate-600">{usuario.cpf ?? "—"}</p>
          <p className="text-xs text-slate-500">{usuario.email}</p>
        </div>
        <StatusBadge ativo={usuario.ativo} />
      </div>
      <dl className="mt-3 space-y-1 text-sm text-slate-600">
        <div>
          <dt className="inline font-medium text-slate-700">Perfil: </dt>
          <dd className="inline">{getRoleLabelSga(usuario.role)}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-slate-700">Escola: </dt>
          <dd className="inline">
            {usuario.escola_id
              ? (escolaNomes[usuario.escola_id] ?? "—")
              : "Secretaria"}
          </dd>
        </div>
      </dl>
      <div className="mt-4">
        <UsuarioActions
          usuario={usuario}
          adminAvailable={adminAvailable}
          className="justify-start"
        />
      </div>
    </li>
  );
}

function UsuarioActions({
  usuario,
  adminAvailable,
  className,
}: {
  usuario: UsuarioListItem;
  adminAvailable: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Link
        href={`/sga/usuarios/${usuario.id}`}
        className="inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        <Pencil className="mr-1 h-3.5 w-3.5" />
        Editar
      </Link>
      {adminAvailable ? (
        <ToggleAtivoButton userId={usuario.id} ativo={usuario.ativo} />
      ) : null}
    </div>
  );
}

function StatusBadge({ ativo }: { ativo: boolean }) {
  return (
    <span
      className={
        ativo
          ? "inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
          : "inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
      }
    >
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}

function ToggleAtivoButton({
  userId,
  ativo,
}: {
  userId: string;
  ativo: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleSgaUsuarioAtivo(userId, !ativo);
        })
      }
      className="inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <>
          <Power className="mr-1 h-3.5 w-3.5" />
          {ativo ? "Desativar" : "Ativar"}
        </>
      )}
    </button>
  );
}
