import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { demoEscolas } from "@/lib/dev-auth";
import { getRoleLabelSga } from "@/lib/sga-dashboard";
import {
  getEscolaNomesMap,
  getSgaLogCadastros,
} from "@/lib/sga-relatorios";
import { createClient } from "@/lib/supabase/server";

export default async function SgaLogCadastrosPage() {
  await requireRole(["tecnico_sga", "admin_sme"]);

  const supabase = await createClient();
  const [log, escolasDb] = await Promise.all([
    getSgaLogCadastros(100),
    getEscolaNomesMap(supabase),
  ]);

  const escolaNomes = {
    ...Object.fromEntries(demoEscolas.map((escola) => [escola.id, escola.nome])),
    ...escolasDb,
  };

  return (
    <>
      <GestorPageHeader
        title="Log de Cadastros"
        description="Últimos usuários criados pelo SGA na rede"
        actions={
          <Link
            href="/sga/relatorios"
            className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Relatórios
          </Link>
        }
      />

      <Card>
        <CardTitle>Cadastros recentes</CardTitle>
        <CardDescription>
          {log.length} registro(s) — ordenados do mais recente ao mais antigo
        </CardDescription>

        <div className="mt-6 hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Data</th>
                <th className="px-3 py-2 font-medium">Nome</th>
                <th className="px-3 py-2 font-medium">Perfil</th>
                <th className="px-3 py-2 font-medium">Escola</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {log.map((usuario) => (
                <tr key={usuario.id} className="border-b border-slate-100">
                  <td className="px-3 py-3 text-slate-600">
                    {new Date(usuario.created_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/sga/usuarios/${usuario.id}`}
                      className="font-medium text-blue-700 hover:underline"
                    >
                      {usuario.nome}
                    </Link>
                    <p className="text-xs text-slate-500">{usuario.email}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    {getRoleLabelSga(usuario.role)}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {usuario.escola_id
                      ? (escolaNomes[usuario.escola_id] ?? "Escola")
                      : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        usuario.ativo
                          ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                          : "rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                      }
                    >
                      {usuario.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                </tr>
              ))}
              {log.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Nenhum cadastro encontrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <ul className="mt-6 space-y-3 md:hidden">
          {log.map((usuario) => (
            <li
              key={usuario.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/sga/usuarios/${usuario.id}`}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    {usuario.nome}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(usuario.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <span
                  className={
                    usuario.ativo
                      ? "shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                      : "shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                  }
                >
                  {usuario.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {getRoleLabelSga(usuario.role)}
                {usuario.escola_id
                  ? ` • ${escolaNomes[usuario.escola_id] ?? "Escola"}`
                  : null}
              </p>
            </li>
          ))}
          {log.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
              Nenhum cadastro encontrado.
            </li>
          ) : null}
        </ul>
      </Card>
    </>
  );
}
