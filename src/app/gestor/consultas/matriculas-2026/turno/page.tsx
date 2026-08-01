import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getGestorEscolaId, getResumoMatriculas } from "@/lib/gestor-relatorios";

function agruparPorTurno(
  porTurma: Awaited<ReturnType<typeof getResumoMatriculas>>["porTurma"],
) {
  const map = new Map<
    string,
    { turno: string; total: number; turmas: number }
  >();

  for (const item of porTurma) {
    const atual = map.get(item.turno) ?? {
      turno: item.turno,
      total: 0,
      turmas: 0,
    };
    atual.total += item.total;
    atual.turmas += 1;
    map.set(item.turno, atual);
  }

  return [...map.values()].sort((a, b) =>
    a.turno.localeCompare(b.turno, "pt-BR"),
  );
}

export default async function GestorMatriculas2026TurnoPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getGestorEscolaId(profile);

  if (profile.role === "gestor_escolar" && !escolaId) {
    return (
      <>
        <GestorPageHeader title="Matrículas 2026 Turno" actions={<BackLink />} />
        <SemEscolaAlert />
      </>
    );
  }

  const resumo = await getResumoMatriculas(profile);
  const porTurno = agruparPorTurno(resumo.porTurma);

  const csvRows = porTurno.map((item) => ({
    Turno: item.turno,
    Turmas: String(item.turmas),
    Matriculados: String(item.total),
  }));

  return (
    <>
      <GestorPageHeader
        title="Matrículas 2026 Turno"
        description="Matrículas consolidadas por turno em 2026"
        actions={
          <div className="flex flex-wrap gap-2">
            <ExportarCsv rows={csvRows} filename="matriculas-2026-turno.csv" />
            <BackLink />
          </div>
        }
      />

      <Card className="mb-6">
        <CardTitle className="text-base">Total matriculados</CardTitle>
        <p className="mt-2 text-3xl font-bold text-[#0D47A1]">
          {resumo.totalMatriculados}
        </p>
      </Card>

      <Card>
        <CardTitle>Por turno</CardTitle>
        <CardDescription>
          Quantitativo de alunos e turmas em cada turno
        </CardDescription>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Turno</th>
                <th className="px-3 py-2 font-medium">Turmas</th>
                <th className="px-3 py-2 font-medium">Matriculados</th>
              </tr>
            </thead>
            <tbody>
              {porTurno.map((item) => (
                <tr
                  key={item.turno}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <td className="px-3 py-3 font-medium text-slate-900">
                    {item.turno}
                  </td>
                  <td className="px-3 py-3 text-slate-700">{item.turmas}</td>
                  <td className="px-3 py-3 font-semibold text-slate-900">
                    {item.total}
                  </td>
                </tr>
              ))}
              {porTurno.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Nenhuma matrícula ativa.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
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
