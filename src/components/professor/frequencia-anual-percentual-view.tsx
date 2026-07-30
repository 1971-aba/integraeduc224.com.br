import Link from "next/link";

import { PresencaBadge } from "@/components/professor/presenca-badge";
import type {
  FrequenciaPercentualFiltro,
  FrequenciaTurmaResumo,
} from "@/lib/professor-diario";

type FrequenciaAnualPercentualViewProps = {
  resumos: FrequenciaTurmaResumo[];
  filtro: FrequenciaPercentualFiltro;
  basePath: string;
};

export function FrequenciaAnualPercentualView({
  resumos,
  filtro,
  basePath,
}: FrequenciaAnualPercentualViewProps) {
  const filtroAtivo = Boolean(filtro.tipo);

  return (
    <>
      <section className="mb-6 rounded-lg border border-[#BBDEFB] bg-[#E3F2FD] p-4">
        <h3 className="text-sm font-semibold text-[#0D47A1]">
          Percentual atingido
        </h3>
        <p className="mt-1 text-sm text-[#1565C0]">
          Filtre alunos pela frequência percentual acumulada no ano letivo.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <form className="flex flex-wrap items-end gap-3" method="get">
            <input type="hidden" name="tipo" value="lte" />
            <div className="min-w-[180px] flex-1">
              <label
                htmlFor="max"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Menor ou igual a (%)
              </label>
              <input
                id="max"
                name="max"
                type="number"
                min={0}
                max={100}
                step={0.1}
                defaultValue={filtro.tipo === "lte" ? filtro.max : ""}
                placeholder="Ex.: 75"
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-md bg-[#4097B1] px-4 text-sm font-semibold text-white hover:bg-[#36899f]"
            >
              Filtrar
            </button>
          </form>

          <form className="flex flex-wrap items-end gap-3" method="get">
            <input type="hidden" name="tipo" value="between" />
            <div className="min-w-[120px] flex-1">
              <label
                htmlFor="min"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Entre (%)
              </label>
              <input
                id="min"
                name="min"
                type="number"
                min={0}
                max={100}
                step={0.1}
                defaultValue={filtro.tipo === "between" ? filtro.min : ""}
                placeholder="Mín."
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
              />
            </div>
            <div className="min-w-[120px] flex-1">
              <label
                htmlFor="maxRange"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                e (%)
              </label>
              <input
                id="maxRange"
                name="maxRange"
                type="number"
                min={0}
                max={100}
                step={0.1}
                defaultValue={filtro.tipo === "between" ? filtro.maxRange : ""}
                placeholder="Máx."
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-md bg-[#4097B1] px-4 text-sm font-semibold text-white hover:bg-[#36899f]"
            >
              Filtrar
            </button>
          </form>
        </div>

        {filtroAtivo ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#1565C0]">
            <span>
              Filtro ativo:{" "}
              {filtro.tipo === "lte"
                ? `presença ≤ ${filtro.max}%`
                : `presença entre ${Math.min(filtro.min ?? 0, filtro.maxRange ?? 0)}% e ${Math.max(filtro.min ?? 0, filtro.maxRange ?? 0)}%`}
            </span>
            <Link
              href={basePath}
              className="font-medium text-[#1E7BB8] hover:underline"
            >
              Limpar filtro
            </Link>
          </div>
        ) : null}
      </section>

      {resumos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-600">
          {filtroAtivo
            ? "Nenhum aluno encontrado com o percentual informado."
            : "Nenhuma turma vinculada ou sem chamadas registradas no ano letivo."}
        </div>
      ) : (
        <div className="space-y-8">
          {resumos.map((turma) => (
            <section
              key={turma.atribuicaoId}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-[#BBDEFB] bg-[#E3F2FD] px-5 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-[#0D47A1]">
                      {turma.disciplina} — {turma.turma}
                    </h2>
                    <p className="text-sm text-[#1565C0]">
                      {turma.serie} • {turma.turno} • {turma.periodoLabel}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#0D47A1]">
                      {turma.percentualPresencaTurma}%
                    </p>
                    <p className="text-xs text-[#1565C0]">
                      presença anual • {turma.totalAulasRegistradas} aula(s)
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Aluno</th>
                      <th className="px-4 py-3 font-medium">Aulas</th>
                      <th className="px-4 py-3 font-medium">Presentes</th>
                      <th className="px-4 py-3 font-medium">Faltas</th>
                      <th className="px-4 py-3 font-medium">Justificadas</th>
                      <th className="px-4 py-3 font-medium">% Presença</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turma.alunos.map((aluno) => (
                      <tr
                        key={aluno.matriculaId}
                        className="border-b border-slate-100"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {aluno.nome}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {aluno.totalAulas}
                        </td>
                        <td className="px-4 py-3 text-green-700">
                          {aluno.presentes}
                        </td>
                        <td className="px-4 py-3 text-red-700">
                          {aluno.faltas}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {aluno.justificadas}
                        </td>
                        <td className="px-4 py-3">
                          <PresencaBadge percentual={aluno.percentualPresenca} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
