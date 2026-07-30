import { ExportarCsv } from "@/components/ui/exportar-csv";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { FrequenciaMensalEscola } from "@/lib/gestor-modulos-types";

type FrequenciaMensalViewProps = {
  relatorio: FrequenciaMensalEscola;
};

export function FrequenciaMensalView({ relatorio }: FrequenciaMensalViewProps) {
  const csvRows = relatorio.turmas.map((turma) => ({
    turma: turma.turmaNome,
    serie: turma.serie,
    alunos: String(turma.totalAlunos),
    aulas: String(turma.totalAulas),
    presentes: String(turma.totalPresentes),
    percentual: String(turma.percentualPresenca),
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardDescription>Alunos matriculados</CardDescription>
          <CardTitle className="text-2xl">{relatorio.totais.alunos}</CardTitle>
        </Card>
        <Card>
          <CardDescription>Aulas registradas</CardDescription>
          <CardTitle className="text-2xl">{relatorio.totais.aulas}</CardTitle>
        </Card>
        <Card>
          <CardDescription>Presenças</CardDescription>
          <CardTitle className="text-2xl">{relatorio.totais.presentes}</CardTitle>
        </Card>
        <Card>
          <CardDescription>Percentual geral</CardDescription>
          <CardTitle className="text-2xl">
            {relatorio.totais.percentual.toFixed(1).replace(".", ",")}%
          </CardTitle>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>
              {relatorio.mesLabel} de {relatorio.ano}
            </CardTitle>
            <CardDescription>Frequência consolidada por turma</CardDescription>
          </div>
          <ExportarCsv
            rows={csvRows}
            filename={`frequencia-mensal-${relatorio.ano}-${relatorio.mes}.csv`}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2 pr-3 font-medium">Turma</th>
                <th className="py-2 pr-3 font-medium">Série</th>
                <th className="py-2 pr-3 text-center font-medium">Alunos</th>
                <th className="py-2 pr-3 text-center font-medium">Aulas</th>
                <th className="py-2 pr-3 text-center font-medium">Presenças</th>
                <th className="py-2 font-medium text-center">%</th>
              </tr>
            </thead>
            <tbody>
              {relatorio.turmas.map((turma) => (
                <tr key={turma.turmaId} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-medium">{turma.turmaNome}</td>
                  <td className="py-2 pr-3">{turma.serie}</td>
                  <td className="py-2 pr-3 text-center">{turma.totalAlunos}</td>
                  <td className="py-2 pr-3 text-center">{turma.totalAulas}</td>
                  <td className="py-2 pr-3 text-center">{turma.totalPresentes}</td>
                  <td className="py-2 text-center font-semibold">
                    {turma.percentualPresenca.toFixed(1).replace(".", ",")}%
                  </td>
                </tr>
              ))}
              {relatorio.turmas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    Nenhuma turma com chamadas no período.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
