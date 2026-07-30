import { Search } from "lucide-react";

import { PresencaBadge } from "@/components/professor/presenca-badge";
import type { FrequenciaDisciplinaAnualResumo } from "@/lib/professor-frequencia-escolar";

type FrequenciaAnualDisciplinaViewProps = {
  disciplinas: FrequenciaDisciplinaAnualResumo[];
  busca?: string;
  basePath: string;
};

export function FrequenciaAnualDisciplinaView({
  disciplinas,
  busca,
  basePath,
}: FrequenciaAnualDisciplinaViewProps) {
  return (
    <>
      <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
        <div className="min-w-[280px] flex-1">
          <label
            htmlFor="q"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Disciplina %
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={busca ?? ""}
            placeholder="Buscar disciplina ou turma"
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

      {disciplinas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-600">
          {busca
            ? "Nenhuma disciplina encontrada para a busca informada."
            : "Nenhuma disciplina vinculada ou sem chamadas registradas no ano letivo."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Disciplina</th>
                <th className="px-4 py-3 font-medium">Turmas</th>
                <th className="px-4 py-3 font-medium">Aulas</th>
                <th className="px-4 py-3 font-medium">% Anual</th>
              </tr>
            </thead>
            <tbody>
              {disciplinas.map((item) => (
                <tr
                  key={item.disciplinaId}
                  className="border-b border-slate-100"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {item.disciplina}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {item.turmas.join(", ")}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.totalAulas}
                  </td>
                  <td className="px-4 py-3">
                    <PresencaBadge percentual={item.percentualPresenca} />
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
