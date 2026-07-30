import type { AlunoNotaDez } from "@/lib/professor-alunos-nota10";

type AlunosNotaDezViewProps = {
  alunos: AlunoNotaDez[];
};

export function AlunosNotaDezView({ alunos }: AlunosNotaDezViewProps) {
  if (alunos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">
        Nenhum aluno com nota 10 registrado nas suas turmas no período
        selecionado.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Aluno
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Turma
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Disciplina
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Bimestre
            </th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700">
              Nota
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {alunos.map((aluno) => (
            <tr key={`${aluno.matriculaId}-${aluno.atribuicaoId}-${aluno.bimestre}`}>
              <td className="px-4 py-3 font-medium text-slate-900">
                {aluno.alunoNome}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {aluno.turma} — {aluno.serie}
              </td>
              <td className="px-4 py-3 text-slate-700">{aluno.disciplina}</td>
              <td className="px-4 py-3 text-slate-700">
                {aluno.bimestre ? `${aluno.bimestre}º bimestre` : "—"}
              </td>
              <td className="px-4 py-3 text-right font-bold text-emerald-700">
                {aluno.nota.toFixed(1).replace(".", ",")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
