import Link from "next/link";

import { PresencaBadge } from "@/components/professor/presenca-badge";
import type { FrequenciaAlunoLinha } from "@/lib/professor-frequencia-escolar";

type FrequenciaAlunoViewProps = {
  linhas: FrequenciaAlunoLinha[];
  atribuicoes: Array<{ id: string; label: string }>;
  atribuicaoId?: string;
  busca?: string;
};

export function FrequenciaAlunoView({
  linhas,
  atribuicoes,
  atribuicaoId,
  busca,
}: FrequenciaAlunoViewProps) {
  return (
    <>
      <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label
            htmlFor="turma"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Turma / Disciplina
          </label>
          <select
            id="turma"
            name="turma"
            defaultValue={atribuicaoId ?? ""}
            className="h-10 min-w-[240px] rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">Todas as turmas</option>
            {atribuicoes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="q"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Aluno
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={busca ?? ""}
            placeholder="Buscar por nome"
            className="h-10 min-w-[220px] rounded-md border border-slate-300 bg-white px-3 text-sm"
          />
        </div>

        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-[#4097B1] px-4 text-sm font-semibold text-white hover:bg-[#36899f]"
        >
          Consultar
        </button>
      </form>

      {linhas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-600">
          Nenhum registro de frequência encontrado para os filtros selecionados.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Aluno</th>
                  <th className="px-4 py-3 font-medium">Turma</th>
                  <th className="px-4 py-3 font-medium">Disciplina</th>
                  <th className="px-4 py-3 font-medium">Período</th>
                  <th className="px-4 py-3 font-medium">Aulas</th>
                  <th className="px-4 py-3 font-medium">Presentes</th>
                  <th className="px-4 py-3 font-medium">Faltas</th>
                  <th className="px-4 py-3 font-medium">Justificadas</th>
                  <th className="px-4 py-3 font-medium">% Presença</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((linha) => (
                  <tr
                    key={`${linha.matriculaId}-${linha.atribuicaoId}`}
                    className="border-b border-slate-100"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {linha.nome}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {linha.turma} — {linha.serie}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {linha.disciplina}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {linha.periodoLabel}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {linha.totalAulas}
                    </td>
                    <td className="px-4 py-3 text-green-700">
                      {linha.presentes}
                    </td>
                    <td className="px-4 py-3 text-red-700">{linha.faltas}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {linha.justificadas}
                    </td>
                    <td className="px-4 py-3">
                      <PresencaBadge percentual={linha.percentualPresenca} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 p-4 md:hidden">
            {linhas.map((linha) => (
              <li
                key={`${linha.matriculaId}-${linha.atribuicaoId}`}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{linha.nome}</p>
                    <p className="text-sm text-slate-600">
                      {linha.disciplina} — {linha.turma}
                    </p>
                  </div>
                  <PresencaBadge percentual={linha.percentualPresenca} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {linha.periodoLabel} • {linha.presentes} presentes /{" "}
                  {linha.totalAulas} aulas
                </p>
                <Link
                  href={`/professor/boletins/individual?turma=${linha.turmaId}&aluno=${linha.matriculaId}`}
                  className="mt-2 inline-block text-sm font-medium text-[#1E7BB8] hover:underline"
                >
                  Ver ficha individual
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
