import { ExportarCsv } from "@/components/ui/exportar-csv";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatTurnoLabel } from "@/lib/dashboard-utils";
import type { BoletimTurmaData } from "@/lib/boletim";

type BoletimTurmaViewProps = {
  boletim: BoletimTurmaData;
  bimestreId?: string;
};

function formatNota(value: number | null) {
  if (value === null) return "—";
  return value.toFixed(1).replace(".", ",");
}

function notaTone(value: number | null) {
  if (value === null) return "text-slate-400";
  if (value >= 6) return "text-green-700 font-semibold";
  if (value >= 5) return "text-amber-700 font-semibold";
  return "text-red-700 font-semibold";
}

export function BoletimTurmaView({ boletim, bimestreId }: BoletimTurmaViewProps) {
  const bimestreNumero =
    boletim.bimestres.find((b) => b.id === bimestreId)?.numero ??
    boletim.bimestres.at(-1)?.numero;

  const csvRows = boletim.alunos.map((aluno) => {
    const row: Record<string, string> = { Aluno: aluno.nome };
    for (const disciplina of boletim.disciplinas) {
      row[disciplina.disciplina] = formatNota(
        aluno.mediasPorDisciplina[disciplina.atribuicaoId] ?? null,
      );
    }
    row["Média geral"] = formatNota(aluno.mediaGeral);
    return row;
  });

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>
            {boletim.turma.nome} — {boletim.turma.serie}
          </CardTitle>
          <CardDescription>
            {formatTurnoLabel(boletim.turma.turno)}
            {bimestreNumero ? ` • ${bimestreNumero}º bimestre` : null} •{" "}
            {boletim.alunos.length} aluno(s)
          </CardDescription>
        </div>
        <ExportarCsv
          rows={csvRows}
          filename={`boletim-${boletim.turma.nome.replace(/\s+/g, "-").toLowerCase()}.csv`}
          label={`Exportar CSV (${csvRows.length})`}
        />
      </div>

      {boletim.disciplinas.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          Nenhuma disciplina atribuída a esta turma.
        </p>
      ) : (
        <>
          <div className="mt-6 hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-3 font-medium">Aluno</th>
                  {boletim.disciplinas.map((disciplina) => (
                    <th
                      key={disciplina.atribuicaoId}
                      className="px-3 py-3 font-medium"
                      title={disciplina.professor}
                    >
                      {disciplina.disciplina}
                    </th>
                  ))}
                  <th className="px-3 py-3 font-medium">Média</th>
                </tr>
              </thead>
              <tbody>
                {boletim.alunos.map((aluno) => (
                  <tr
                    key={aluno.matriculaId}
                    className="border-b border-slate-100"
                  >
                    <td className="px-3 py-3 font-medium text-slate-900">
                      {aluno.nome}
                    </td>
                    {boletim.disciplinas.map((disciplina) => {
                      const media =
                        aluno.mediasPorDisciplina[disciplina.atribuicaoId] ??
                        null;
                      return (
                        <td
                          key={disciplina.atribuicaoId}
                          className={`px-3 py-3 ${notaTone(media)}`}
                        >
                          {formatNota(media)}
                        </td>
                      );
                    })}
                    <td className={`px-3 py-3 ${notaTone(aluno.mediaGeral)}`}>
                      {formatNota(aluno.mediaGeral)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-6 space-y-3 md:hidden">
            {boletim.alunos.map((aluno) => (
              <li
                key={aluno.matriculaId}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <p className="font-medium text-slate-900">{aluno.nome}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {boletim.disciplinas.map((disciplina) => {
                    const media =
                      aluno.mediasPorDisciplina[disciplina.atribuicaoId] ??
                      null;
                    return (
                      <div key={disciplina.atribuicaoId}>
                        <dt className="text-xs text-slate-500">
                          {disciplina.disciplina}
                        </dt>
                        <dd className={notaTone(media)}>{formatNota(media)}</dd>
                      </div>
                    );
                  })}
                  <div className="col-span-2 border-t border-slate-200 pt-2">
                    <dt className="text-xs text-slate-500">Média geral</dt>
                    <dd className={notaTone(aluno.mediaGeral)}>
                      {formatNota(aluno.mediaGeral)}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs text-slate-500">
            Médias exibidas conforme lançamento docente. Passe o mouse sobre a
            disciplina para ver o professor responsável.
          </p>
        </>
      )}
    </Card>
  );
}
