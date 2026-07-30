import { Search } from "lucide-react";

import { PresencaBadge } from "@/components/professor/presenca-badge";
import type { FrequenciaTurmaAnualResumo } from "@/lib/professor-frequencia-escolar";

type FrequenciaAnualTurmaViewProps = {
  turmas: FrequenciaTurmaAnualResumo[];
  busca?: string;
  basePath: string;
};

export function FrequenciaAnualTurmaView({
  turmas,
  busca,
  basePath,
}: FrequenciaAnualTurmaViewProps) {
  return (
    <>
      <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
        <div className="min-w-[280px] flex-1">
          <label
            htmlFor="q"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Turma Ano %
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={busca ?? ""}
            placeholder="Buscar turma, série ou disciplina"
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#4097B1] px-4 text-sm font-semibold text-white hover:bg-[#36899f]"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Consultar
        </button>
      </form>

      {turmas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-600">
          {busca
            ? "Nenhuma turma encontrada para a busca informada."
            : "Nenhuma turma vinculada ou sem chamadas registradas no ano letivo."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Turma</th>
                <th className="px-4 py-3 font-medium">Série / Turno</th>
                <th className="px-4 py-3 font-medium">Disciplinas</th>
                <th className="px-4 py-3 font-medium">Alunos</th>
                <th className="px-4 py-3 font-medium">Aulas</th>
                <th className="px-4 py-3 font-medium">% Anual</th>
              </tr>
            </thead>
            <tbody>
              {turmas.map((turma) => (
                <tr
                  key={turma.turmaId}
                  className="border-b border-slate-100"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {turma.turma}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {turma.serie} • {turma.turno}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {turma.disciplinas.join(", ")}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {turma.totalAlunos}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {turma.totalAulas}
                  </td>
                  <td className="px-4 py-3">
                    <PresencaBadge percentual={turma.percentualPresenca} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {busca ? (
        <p className="mt-4 text-sm text-slate-600">
          <a href={basePath} className="font-medium text-[#1E7BB8] hover:underline">
            Limpar busca
          </a>
        </p>
      ) : null}
    </>
  );
}
