import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getGestorEscolaId, getResumoMatriculas } from "@/lib/gestor-relatorios";

export default async function GestorMatriculas2026GeralPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getGestorEscolaId(profile);

  if (profile.role === "gestor_escolar" && !escolaId) {
    return (
      <>
        <GestorPageHeader title="Matrículas 2026 Geral" actions={<BackLink />} />
        <SemEscolaAlert />
      </>
    );
  }

  const resumo = await getResumoMatriculas(profile);

  const csvRows = resumo.porTurma.map((item) => ({
    Escola: item.escolaNome,
    Turma: item.turmaNome,
    Serie: item.serie,
    Turno: item.turno,
    Matriculados: String(item.total),
  }));

  return (
    <>
      <GestorPageHeader
        title="Matrículas 2026 Geral"
        description="Panorama geral dos estudantes matriculados em 2026"
        actions={
          <div className="flex flex-wrap gap-2">
            <ExportarCsv rows={csvRows} filename="matriculas-2026-geral.csv" />
            <BackLink />
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle className="text-base">Total matriculados</CardTitle>
          <p className="mt-2 text-3xl font-bold text-[#0D47A1]">
            {resumo.totalMatriculados}
          </p>
        </Card>
        <Card>
          <CardTitle className="text-base">Turmas com matrícula</CardTitle>
          <p className="mt-2 text-3xl font-bold text-[#0D47A1]">
            {resumo.totalTurmas}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Por turma</CardTitle>
          <CardDescription>Quantitativo em cada turma</CardDescription>
          <ul className="mt-4 space-y-2 text-sm">
            {resumo.porTurma.map((item) => (
              <li
                key={`${item.escolaNome}-${item.turmaNome}-${item.turno}`}
                className="flex justify-between rounded-lg border border-slate-100 px-3 py-2"
              >
                <span className="text-slate-700">
                  {item.turmaNome} ({item.serie}) — {item.turno}
                  {profile.role === "admin_sme" ? ` • ${item.escolaNome}` : null}
                </span>
                <span className="font-semibold text-slate-900">{item.total}</span>
              </li>
            ))}
            {resumo.porTurma.length === 0 ? (
              <li className="text-slate-500">Nenhuma matrícula ativa.</li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <CardTitle>Por série</CardTitle>
          <CardDescription>Consolidado por ano escolar</CardDescription>
          <ul className="mt-4 space-y-2 text-sm">
            {resumo.porSerie.map((item) => (
              <li
                key={item.serie}
                className="flex justify-between rounded-lg border border-slate-100 px-3 py-2"
              >
                <span className="text-slate-700">{item.serie}</span>
                <span className="font-semibold text-slate-900">
                  {item.totalAlunos} ({item.turmas} turma(s))
                </span>
              </li>
            ))}
            {resumo.porSerie.length === 0 ? (
              <li className="text-slate-500">Nenhuma matrícula ativa.</li>
            ) : null}
          </ul>
        </Card>
      </div>
    </>
  );
}

function BackLink() {
  return (
    <Link
      href="/gestor/relatorios"
      className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Relatórios
    </Link>
  );
}
