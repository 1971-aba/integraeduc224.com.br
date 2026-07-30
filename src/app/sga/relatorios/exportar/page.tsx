import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ExportarUsuariosCsv } from "@/components/sga/exportar-usuarios-csv";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { demoEscolas } from "@/lib/dev-auth";
import { getRoleLabelSga } from "@/lib/sga-dashboard";
import {
  formatUsuarioParaCsv,
  getEscolaNomesMap,
  getSgaUsuariosParaExportacao,
} from "@/lib/sga-relatorios";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export default async function SgaExportarUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{
    perfil?: UserRole;
    status?: "ativo" | "inativo";
  }>;
}) {
  await requireRole(["tecnico_sga", "admin_sme"]);
  const params = await searchParams;

  const supabase = await createClient();
  const [usuarios, escolasDb] = await Promise.all([
    getSgaUsuariosParaExportacao({
      perfil: params.perfil,
      status: params.status,
    }),
    getEscolaNomesMap(supabase),
  ]);

  const escolaNomes = {
    ...Object.fromEntries(demoEscolas.map((escola) => [escola.id, escola.nome])),
    ...escolasDb,
  };

  const csvRows = usuarios.map((usuario) => {
    const formatted = formatUsuarioParaCsv(usuario, escolaNomes);
    return {
      Nome: formatted.nome,
      Email: formatted.email,
      CPF: formatted.cpf,
      Perfil: formatted.perfil,
      Escola: formatted.escola,
      Status: formatted.status,
      "Data cadastro": formatted.cadastro,
    };
  });

  return (
    <>
      <GestorPageHeader
        title="Exportar Usuários"
        description="Baixe a relação de acessos da rede em CSV"
        actions={
          <div className="flex flex-wrap gap-2">
            <ExportarUsuariosCsv rows={csvRows} />
            <Link
              href="/sga/relatorios"
              className="inline-flex h-11 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Relatórios
            </Link>
          </div>
        }
      />

      <form className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <label
            htmlFor="perfil"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Perfil
          </label>
          <select
            id="perfil"
            name="perfil"
            defaultValue={params.perfil ?? ""}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
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
          <label
            htmlFor="status"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={params.status ?? ""}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          >
            <option value="">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399]"
        >
          Filtrar
        </button>
      </form>

      <Card>
        <CardTitle>Pré-visualização</CardTitle>
        <CardDescription>
          {usuarios.length} usuário(s) serão exportados com os filtros atuais
          {params.perfil ? ` • ${getRoleLabelSga(params.perfil)}` : ""}
          {params.status ? ` • ${params.status === "ativo" ? "Ativos" : "Inativos"}` : ""}
        </CardDescription>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Nome</th>
                <th className="px-3 py-2 font-medium">E-mail</th>
                <th className="px-3 py-2 font-medium">Perfil</th>
                <th className="px-3 py-2 font-medium">Escola</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.slice(0, 20).map((usuario) => (
                <tr key={usuario.id} className="border-b border-slate-100">
                  <td className="px-3 py-3 font-medium text-slate-900">
                    {usuario.nome}
                  </td>
                  <td className="px-3 py-3 text-slate-600">{usuario.email}</td>
                  <td className="px-3 py-3 text-slate-700">
                    {getRoleLabelSga(usuario.role)}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {usuario.escola_id
                      ? (escolaNomes[usuario.escola_id] ?? "Escola")
                      : "—"}
                  </td>
                  <td className="px-3 py-3">
                    {usuario.ativo ? "Ativo" : "Inativo"}
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Nenhum usuário para exportar.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {usuarios.length > 20 ? (
          <p className="mt-4 text-sm text-slate-500">
            Mostrando 20 de {usuarios.length} registros. O CSV incluirá todos.
          </p>
        ) : null}
      </Card>
    </>
  );
}
