import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getSgaAcessosPorPerfil } from "@/lib/sga-relatorios";

export default async function SgaAcessosPorPerfilPage() {
  await requireRole(["tecnico_sga", "admin_sme"]);

  const acessos = await getSgaAcessosPorPerfil();
  const totalGeral = acessos.reduce((sum, item) => sum + item.total, 0);
  const ativosGeral = acessos.reduce((sum, item) => sum + item.ativos, 0);

  return (
    <>
      <GestorPageHeader
        title="Acessos por Perfil"
        description="Distribuição de usuários cadastrados na rede por perfil de acesso"
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

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <ResumoCard label="Total na rede" value={totalGeral} />
        <ResumoCard label="Acessos ativos" value={ativosGeral} />
        <ResumoCard
          label="Usuários inativos"
          value={totalGeral - ativosGeral}
        />
      </div>

      <Card>
        <CardTitle>Distribuição por perfil</CardTitle>
        <CardDescription>
          {totalGeral} usuário(s) cadastrado(s) no SGA
        </CardDescription>

        <div className="mt-6 hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Perfil</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-3 py-2 font-medium">Ativos</th>
                <th className="px-3 py-2 font-medium">Inativos</th>
                <th className="px-3 py-2 font-medium">% Ativos</th>
              </tr>
            </thead>
            <tbody>
              {acessos.map((item) => (
                <tr key={item.role} className="border-b border-slate-100">
                  <td className="px-3 py-3 font-medium text-slate-900">
                    {item.label}
                  </td>
                  <td className="px-3 py-3 text-slate-700">{item.total}</td>
                  <td className="px-3 py-3 text-green-700">{item.ativos}</td>
                  <td className="px-3 py-3 text-slate-600">{item.inativos}</td>
                  <td className="px-3 py-3 text-slate-700">
                    {item.total > 0
                      ? `${Math.round((item.ativos / item.total) * 100)}%`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-6 space-y-3 md:hidden">
          {acessos.map((item) => (
            <li
              key={item.role}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <p className="font-medium text-slate-900">{item.label}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <span>Total: {item.total}</span>
                <span className="text-green-700">Ativos: {item.ativos}</span>
                <span>Inativos: {item.inativos}</span>
                <span>
                  % Ativos:{" "}
                  {item.total > 0
                    ? `${Math.round((item.ativos / item.total) * 100)}%`
                    : "—"}
                </span>
              </div>
              {totalGeral > 0 ? (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#1E7BB8]"
                    style={{
                      width: `${Math.round((item.total / totalGeral) * 100)}%`,
                    }}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>

        {totalGeral > 0 ? (
          <div className="mt-8 hidden md:block">
            <p className="mb-3 text-sm font-medium text-slate-700">
              Participação na rede
            </p>
            <div className="space-y-3">
              {acessos
                .filter((item) => item.total > 0)
                .map((item) => (
                  <div key={item.role}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="font-medium text-slate-900">
                        {item.total} ({Math.round((item.total / totalGeral) * 100)}
                        %)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#1E7BB8]"
                        style={{
                          width: `${Math.round((item.total / totalGeral) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : null}
      </Card>
    </>
  );
}

function ResumoCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#BBDEFB] bg-[#E3F2FD]/40 px-4 py-4">
      <p className="text-2xl font-bold text-[#0D47A1]">{value}</p>
      <p className="text-sm text-[#1565C0]">{label}</p>
    </div>
  );
}
