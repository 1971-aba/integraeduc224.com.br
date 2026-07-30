import Link from "next/link";



import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";

import { requireRole } from "@/lib/auth";

import {
  filtrarFrequenciaPorPercentual,
  getFrequenciaConsolidada,
  getProfessorBimestreOptions,
  parseFrequenciaPercentualFiltro,
} from "@/lib/professor-diario";



export default async function FrequenciaConsolidadaPage({

  searchParams,

}: {

  searchParams: Promise<{

    bimestre?: string;

    turma?: string;

    tipo?: string;

    max?: string;

    min?: string;

    maxRange?: string;

  }>;

}) {

  const params = await searchParams;

  const { bimestre: bimestreId, turma: turmaId } = params;

  const filtro = parseFrequenciaPercentualFiltro(params);

  const { profile } = await requireRole(["professor"]);



  const [resumosBrutos, bimestres] = await Promise.all([

    getFrequenciaConsolidada(profile.id, bimestreId),

    getProfessorBimestreOptions(profile.id),

  ]);



  let resumosFiltrados = resumosBrutos;

  if (turmaId) {
    resumosFiltrados = resumosFiltrados.filter(
      (item) => item.atribuicaoId === turmaId,
    );
  }

  const resumos = filtrarFrequenciaPorPercentual(resumosFiltrados, filtro);

  const filtroAtivo = Boolean(filtro.tipo);



  return (

    <>

      <GestorPageHeader

        title="Frequência Consolidada"

        description="Percentual de presença por turma e aluno no período letivo"

      />



      <form className="mb-4 flex flex-wrap items-end gap-3" method="get">

        <div>

          <label

            htmlFor="bimestre"

            className="mb-1 block text-sm font-medium text-slate-700"

          >

            Bimestre

          </label>

          <select

            id="bimestre"

            name="bimestre"

            defaultValue={bimestreId ?? ""}

            className="h-10 min-w-[200px] rounded-md border border-slate-300 bg-white px-3 text-sm"

          >

            <option value="">Bimestre atual (automático)</option>

            {bimestres.map((item) => (

              <option key={item.id} value={item.id}>

                {item.label}

              </option>

            ))}

          </select>

        </div>

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

            defaultValue={turmaId ?? ""}

            className="h-10 min-w-[220px] rounded-md border border-slate-300 bg-white px-3 text-sm"

          >

            <option value="">Todas as turmas</option>

            {resumosBrutos.map((item) => (

              <option key={item.atribuicaoId} value={item.atribuicaoId}>

                {item.disciplina} — {item.turma}

              </option>

            ))}

          </select>

        </div>

        <button

          type="submit"

          className="inline-flex h-10 items-center rounded-md bg-[#4097B1] px-4 text-sm font-semibold text-white hover:bg-[#36899f]"

        >

          Atualizar

        </button>

      </form>



      <section className="mb-6 rounded-lg border border-[#BBDEFB] bg-[#E3F2FD] p-4">

        <h3 className="text-sm font-semibold text-[#0D47A1]">

          Percentual atingido

        </h3>

        <p className="mt-1 text-sm text-[#1565C0]">

          Filtre alunos pela frequência percentual no período selecionado.

        </p>



        <div className="mt-4 grid gap-4 lg:grid-cols-2">

          <form className="flex flex-wrap items-end gap-3" method="get">

            {bimestreId ? (

              <input type="hidden" name="bimestre" value={bimestreId} />

            ) : null}

            {turmaId ? (

              <input type="hidden" name="turma" value={turmaId} />

            ) : null}

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

            {bimestreId ? (

              <input type="hidden" name="bimestre" value={bimestreId} />

            ) : null}

            {turmaId ? (

              <input type="hidden" name="turma" value={turmaId} />

            ) : null}

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

              href={

                bimestreId

                  ? `/professor/consultas/frequencia?bimestre=${bimestreId}`

                  : "/professor/consultas/frequencia"

              }

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

            : "Nenhuma turma vinculada ou sem chamadas registradas no período."}

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

                      presença da turma • {turma.totalAulasRegistradas} aula(s)

                    </p>

                  </div>

                </div>

              </div>



              <div className="hidden overflow-x-auto md:block">
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

                    {turma.alunos.length === 0 ? (

                      <tr>

                        <td

                          colSpan={6}

                          className="px-4 py-8 text-center text-slate-500"

                        >

                          Nenhum aluno matriculado nesta turma.

                        </td>

                      </tr>

                    ) : null}

                  </tbody>

                </table>
              </div>

              <ul className="space-y-3 p-4 md:hidden">
                {turma.alunos.map((aluno) => (
                  <li
                    key={aluno.matriculaId}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-slate-900">{aluno.nome}</p>
                      <PresencaBadge percentual={aluno.percentualPresenca} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
                      <div>
                        <dt className="text-xs text-slate-500">Aulas</dt>
                        <dd>{aluno.totalAulas}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Presentes</dt>
                        <dd className="text-green-700">{aluno.presentes}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Faltas</dt>
                        <dd className="text-red-700">{aluno.faltas}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Justificadas</dt>
                        <dd>{aluno.justificadas}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
                {turma.alunos.length === 0 ? (
                  <li className="py-8 text-center text-sm text-slate-500">
                    Nenhum aluno matriculado nesta turma.
                  </li>
                ) : null}
              </ul>



              <div className="border-t border-slate-100 px-5 py-3 text-right">

                <Link

                  href={`/professor/turma/${turma.atribuicaoId}/chamada`}

                  className="text-sm font-medium text-[#1E7BB8] hover:underline"

                >

                  Abrir diário desta turma →

                </Link>

              </div>

            </section>

          ))}

        </div>

      )}

    </>

  );

}



function PresencaBadge({ percentual }: { percentual: number }) {

  const tone =

    percentual >= 75

      ? "bg-green-100 text-green-800"

      : percentual >= 50

        ? "bg-amber-100 text-amber-800"

        : "bg-red-100 text-red-800";



  return (

    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>

      {percentual}%

    </span>

  );

}


