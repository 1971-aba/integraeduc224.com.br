import { ExportarCsv } from "@/components/ui/exportar-csv";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type RelatorioAvaliativoViewProps = {
  relatorio: import("@/lib/relatorio-avaliativo").RelatorioAvaliativoEscola;
};

function formatNota(value: number | null) {
  if (value === null) return "—";
  return value.toFixed(1).replace(".", ",");
}

function pct(parte: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((parte / total) * 100)}%`;
}

export function RelatorioAvaliativoView({ relatorio }: RelatorioAvaliativoViewProps) {
  const csvTurmas = relatorio.turmas.map((turma) => ({
    turma: turma.turmaNome,
    serie: turma.serie,
    turno: turma.turno,
    alunos: String(turma.totalAlunos),
    media: turma.mediaTurma != null ? String(turma.mediaTurma) : "",
    aprovados: String(turma.aprovados),
    reprovados: String(turma.reprovados),
    sem_nota: String(turma.semNota),
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardDescription>Alunos avaliados</CardDescription>
          <CardTitle className="text-2xl">{relatorio.totais.alunos}</CardTitle>
        </Card>
        <Card>
          <CardDescription>Média geral da escola</CardDescription>
          <CardTitle className="text-2xl">
            {formatNota(relatorio.totais.mediaGeral)}
          </CardTitle>
        </Card>
        <Card>
          <CardDescription>Aprovados (média ≥ 6)</CardDescription>
          <CardTitle className="text-2xl text-emerald-700">
            {relatorio.totais.aprovados}{" "}
            <span className="text-base font-normal text-slate-500">
              ({pct(relatorio.totais.aprovados, relatorio.totais.alunos)})
            </span>
          </CardTitle>
        </Card>
        <Card>
          <CardDescription>Reprovados (média &lt; 6)</CardDescription>
          <CardTitle className="text-2xl text-rose-700">
            {relatorio.totais.reprovados}{" "}
            <span className="text-base font-normal text-slate-500">
              ({pct(relatorio.totais.reprovados, relatorio.totais.alunos)})
            </span>
          </CardTitle>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Desempenho por turma</CardTitle>
            <CardDescription>
              Médias consolidadas com base nas notas lançadas
            </CardDescription>
          </div>
          <ExportarCsv
            rows={csvTurmas}
            filename="relatorio-avaliativo-turmas.csv"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2 pr-3 font-medium">Turma</th>
                <th className="py-2 pr-3 font-medium">Série</th>
                <th className="py-2 pr-3 font-medium">Turno</th>
                <th className="py-2 pr-3 font-medium text-center">Alunos</th>
                <th className="py-2 pr-3 font-medium text-center">Média</th>
                <th className="py-2 pr-3 font-medium text-center">Aprov.</th>
                <th className="py-2 font-medium text-center">Reprov.</th>
              </tr>
            </thead>
            <tbody>
              {relatorio.turmas.map((turma) => (
                <tr key={turma.turmaId} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-medium text-slate-900">
                    {turma.turmaNome}
                  </td>
                  <td className="py-2 pr-3">{turma.serie}</td>
                  <td className="py-2 pr-3">{turma.turno}</td>
                  <td className="py-2 pr-3 text-center">{turma.totalAlunos}</td>
                  <td className="py-2 pr-3 text-center font-semibold">
                    {formatNota(turma.mediaTurma)}
                  </td>
                  <td className="py-2 pr-3 text-center text-emerald-700">
                    {turma.aprovados}
                  </td>
                  <td className="py-2 text-center text-rose-700">
                    {turma.reprovados}
                  </td>
                </tr>
              ))}
              {relatorio.turmas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    Nenhuma turma com notas lançadas.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {relatorio.disciplinas.length > 0 ? (
        <Card>
          <CardTitle className="mb-4">Média por disciplina (escola)</CardTitle>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2 pr-3 font-medium">Disciplina</th>
                  <th className="py-2 pr-3 font-medium text-center">Turmas</th>
                  <th className="py-2 font-medium text-center">Média</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.disciplinas.map((item) => (
                  <tr
                    key={item.disciplina}
                    className="border-b border-slate-100"
                  >
                    <td className="py-2 pr-3">{item.disciplina}</td>
                    <td className="py-2 pr-3 text-center">
                      {item.turmasComNota}
                    </td>
                    <td className="py-2 text-center font-semibold">
                      {formatNota(item.mediaDisciplina)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
