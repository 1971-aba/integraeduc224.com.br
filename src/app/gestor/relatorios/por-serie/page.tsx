import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getRelatorioPorSerie } from "@/lib/gestor-relatorios";

export default async function GestorRelatorioPorSeriePage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const series = await getRelatorioPorSerie(profile);

  const csvRows = series.map((item) => ({
    Serie: item.serie,
    Turmas: String(item.turmas),
    "Total alunos": String(item.totalAlunos),
  }));

  const maxAlunos = Math.max(...series.map((item) => item.totalAlunos), 1);

  return (
    <>
      <GestorPageHeader
        title="Alunos por Série"
        description="Quantitativo consolidado por ano/série escolar"
        actions={
          <div className="flex flex-wrap gap-2">
            <ExportarCsv rows={csvRows} filename="alunos-por-serie.csv" />
            <Link
              href="/gestor/relatorios"
              className="inline-flex h-11 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Relatórios
            </Link>
          </div>
        }
      />

      <Card>
        <CardTitle>Distribuição por série</CardTitle>
        <CardDescription>
          {series.reduce((sum, item) => sum + item.totalAlunos, 0)} aluno(s)
          matriculado(s) em {series.length} série(s)
        </CardDescription>

        {series.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            Nenhuma matrícula encontrada.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {series.map((item) => (
              <div key={item.serie}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-900">{item.serie}</span>
                  <span className="text-slate-600">
                    {item.totalAlunos} aluno(s) • {item.turmas} turma(s)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#1E7BB8]"
                    style={{
                      width: `${Math.round((item.totalAlunos / maxAlunos) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Série</th>
                <th className="px-3 py-2 font-medium">Turmas</th>
                <th className="px-3 py-2 font-medium">Total alunos</th>
              </tr>
            </thead>
            <tbody>
              {series.map((item) => (
                <tr key={item.serie} className="border-b border-slate-100">
                  <td className="px-3 py-3 font-medium text-slate-900">
                    {item.serie}
                  </td>
                  <td className="px-3 py-3 text-slate-600">{item.turmas}</td>
                  <td className="px-3 py-3 text-slate-700">
                    {item.totalAlunos}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
