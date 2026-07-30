import Link from "next/link";
import { UserPlus } from "lucide-react";

import { listSgaUsuarios } from "@/actions/sga-usuarios";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { UsuariosPorEscolaView } from "@/components/sga/usuarios-por-escola";
import { UsuariosTable } from "@/components/sga/usuarios-table";
import { requireRole, isSgaManagementAvailable } from "@/lib/auth";
import { demoEscolas } from "@/lib/dev-auth";
import { getRoleLabelSga } from "@/lib/sga-dashboard";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

function buildGruposPorEscola(
  usuarios: Awaited<ReturnType<typeof listSgaUsuarios>>,
  escolaNomes: Record<string, string>,
) {
  const map = new Map<
    string | null,
    {
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
    }
  >();

  for (const usuario of usuarios) {
    const key = usuario.escola_id;
    const grupo = map.get(key) ?? {
      escolaId: key,
      escolaNome: key
        ? (escolaNomes[key] ?? "Escola")
        : "Secretaria / Sem escola vinculada",
      total: 0,
      ativos: 0,
      usuarios: [],
    };

    grupo.total += 1;
    if (usuario.ativo) grupo.ativos += 1;
    grupo.usuarios.push({
      id: usuario.id,
      nome: usuario.nome,
      role: usuario.role as UserRole,
      ativo: usuario.ativo,
    });
    map.set(key, grupo);
  }

  return [...map.values()]
    .map((grupo) => ({
      ...grupo,
      usuarios: grupo.usuarios.sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR"),
      ),
    }))
    .sort((a, b) => a.escolaNome.localeCompare(b.escolaNome, "pt-BR"));
}

export default async function SgaUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{
    perfil?: UserRole;
    status?: "ativo" | "inativo";
    q?: string;
    agrupar?: string;
    escola?: string;
  }>;
}) {
  const { profile } = await requireRole(["tecnico_sga", "admin_sme"]);
  const sgaManagementAvailable = await isSgaManagementAvailable();
  const params = await searchParams;

  const supabase = await createClient();
  const { data: escolasDb } = await supabase
    .from("escolas")
    .select("id, nome")
    .order("nome");

  const escolaNomes = Object.fromEntries(
    [...demoEscolas, ...(escolasDb ?? [])].map((escola) => [
      escola.id,
      escola.nome,
    ]),
  );

  let usuarios = await listSgaUsuarios({
    perfil: params.perfil,
    status: params.status,
    q: params.q,
  });

  if (params.escola) {
    usuarios = usuarios.filter((item) => item.escola_id === params.escola);
  }

  const agruparEscola = params.agrupar === "escola";

  const titulo = agruparEscola
    ? "Usuários por escola"
    : params.escola
      ? (escolaNomes[params.escola] ?? "Usuários da escola")
      : params.perfil
        ? getRoleLabelSga(params.perfil)
        : params.status === "inativo"
          ? "Usuários inativos"
          : "Usuários da rede";

  return (
    <>
      <GestorPageHeader
        title={titulo}
        description="Consulte, edite e gerencie logins e senhas de todos os perfis"
        actions={
          <Link
            href="/sga/usuarios/novo"
            className="inline-flex h-10 items-center rounded-md bg-[#4097B1] px-4 text-sm font-semibold text-white hover:bg-[#36899f]"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Cadastrar usuário
          </Link>
        }
      />

      <form className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="q" className="mb-1 block text-sm font-medium text-slate-700">
            Buscar
          </label>
          <input
            id="q"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Nome, CPF ou e-mail"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4097B1]/40"
          />
        </div>
        <div>
          <label htmlFor="perfil" className="mb-1 block text-sm font-medium text-slate-700">
            Perfil
          </label>
          <select
            id="perfil"
            name="perfil"
            defaultValue={params.perfil ?? ""}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4097B1]/40"
          >
            <option value="">Todos</option>
            <option value="gestor_escolar">Gestor Escolar</option>
            <option value="coordenador">Coordenador</option>
            <option value="professor">Professor</option>
            <option value="tecnico_sga">Técnico SGA</option>
            <option value="admin_sme">Admin SME</option>
          </select>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={params.status ?? ""}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4097B1]/40"
          >
            <option value="">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
        {!agruparEscola ? (
          <div>
            <label
              htmlFor="escola"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Escola
            </label>
            <select
              id="escola"
              name="escola"
              defaultValue={params.escola ?? ""}
              className="h-10 min-w-[180px] rounded-md border border-slate-300 px-3 text-sm"
            >
              <option value="">Todas</option>
              {Object.entries(escolaNomes).map(([id, nome]) => (
                <option key={id} value={id}>
                  {nome}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <input type="hidden" name="agrupar" value="escola" />
        )}
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399]"
        >
          Filtrar
        </button>
      </form>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/sga/usuarios"
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            !agruparEscola
              ? "bg-[#1E7BB8] text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Lista
        </Link>
        <Link
          href="/sga/usuarios?agrupar=escola"
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            agruparEscola
              ? "bg-[#1E7BB8] text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Por escola
        </Link>
      </div>

      {agruparEscola ? (
        <UsuariosPorEscolaView
          grupos={buildGruposPorEscola(usuarios, escolaNomes)}
        />
      ) : (
        <UsuariosTable
          usuarios={usuarios}
          escolaNomes={escolaNomes}
          adminAvailable={sgaManagementAvailable}
        />
      )}
    </>
  );
}
