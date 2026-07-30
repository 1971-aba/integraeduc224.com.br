import Link from "next/link";

import { getRoleLabelSga } from "@/lib/sga-dashboard";
import type { UserRole } from "@/types/database";

export type UsuarioEscolaGroup = {
  escolaId: string | null;
  escolaNome: string;
  total: number;
  ativos: number;
  usuarios: Array<{
    id: string;
    nome: string;
    role: UserRole;
    ativo: boolean;
  }>;
};

export function UsuariosPorEscolaView({
  grupos,
}: {
  grupos: UsuarioEscolaGroup[];
}) {
  if (grupos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
        <p className="font-medium text-slate-800">Nenhum usuário encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grupos.map((grupo) => (
        <section
          key={grupo.escolaId ?? "secretaria"}
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">{grupo.escolaNome}</h2>
              <p className="text-sm text-slate-600">
                {grupo.total} usuário(s) • {grupo.ativos} ativo(s)
              </p>
            </div>
            {grupo.escolaId ? (
              <Link
                href={`/sga/usuarios?escola=${grupo.escolaId}`}
                className="text-sm font-medium text-[#1E7BB8] hover:underline"
              >
                Ver lista
              </Link>
            ) : null}
          </div>

          <ul className="divide-y divide-slate-100">
            {grupo.usuarios.map((usuario) => (
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
      ))}
    </div>
  );
}
