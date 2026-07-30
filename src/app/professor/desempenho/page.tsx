import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getProfessorAtribuicoes } from "@/lib/diario";
import { getDesempenhoAtribuicao } from "@/lib/professor-desempenho";

function formatNota(value: number | null) {
  if (value === null) return "—";
  return value.toFixed(1).replace(".", ",");
}

export default async function ProfessorDesempenhoPage({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string; bimestre?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["professor"]);

  const atribuicoes = await getProfessorAtribuicoes(profile.id);
  const atribuicoesAtivas = atribuicoes.filter(
    (item) => item.anos_letivos?.ativo,
  );

  const atribuicaoId = params.turma ?? atribuicoesAtivas[0]?.id;
  const desempenho = atribuicaoId
    ? await getDesempenhoAtribuicao(
        atribuicaoId,
        profile.id,
        params.bimestre,
      )
    : null;

  const bimestresOpcoes = desempenho?.todosBimestres ?? [];

  return (
    <>
      <GestorPageHeader
        title="Desempenho da Turma"
        description="Médias dos alunos na sua disciplina"
      />

      {atribuicoesAtivas.length > 0 ? (
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
              {atribuicoesAtivas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.disciplinas?.nome} — {item.turmas?.nome} (
                  {item.turmas?.serie})
                </option>
              ))}
            </select>
          </div>

          {bimestresOpcoes.length > 0 ? (
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
                defaultValue={params.bimestre ?? ""}
                className="h-10 min-w-[160px] rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="">Média anual</option>
                {bimestresOpcoes.map((bimestre) => (
                  <option key={bimestre.id} value={bimestre.id}>
                    {bimestre.numero}º bimestre
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399]"
          >
            Atualizar
          </button>
        </form>
      ) : null}

      {desempenho ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardDescription>Média da turma</CardDescription>
              <CardTitle className="text-2xl">
                {formatNota(desempenho.mediaTurma)}
              </CardTitle>
            </Card>
            <Card>
              <CardDescription>Aprovados (≥ 6)</CardDescription>
              <CardTitle className="text-2xl text-emerald-700">
                {desempenho.aprovados}
              </CardTitle>
            </Card>
            <Card>
              <CardDescription>Reprovados (&lt; 6)</CardDescription>
              <CardTitle className="text-2xl text-rose-700">
                {desempenho.reprovados}
              </CardTitle>
            </Card>
          </div>

          <Card>
            <CardTitle>
              {desempenho.disciplina} — {desempenho.turma} ({desempenho.serie})
            </CardTitle>
            <CardDescription>
              {desempenho.alunos.length} aluno(s) matriculado(s)
            </CardDescription>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Aluno</th>
                    {desempenho.bimestres.map((bimestre) => (
                      <th key={bimestre.id} className="px-2 py-2 font-medium">
                        {bimestre.numero}º B
                      </th>
                    ))}
                    <th className="py-2 pl-2 font-medium">Média</th>
                  </tr>
                </thead>
                <tbody>
                  {desempenho.alunos.map((aluno) => (
                    <tr
                      key={aluno.matriculaId}
                      className="border-b border-slate-100"
                    >
                      <td className="py-2 pr-3">{aluno.nome}</td>
                      {desempenho.bimestres.map((bimestre) => (
                        <td key={bimestre.id} className="px-2 py-2 text-center">
                          {formatNota(
                            aluno.mediasPorBimestre[bimestre.numero] ?? null,
                          )}
                        </td>
                      ))}
                      <td
                        className={`py-2 pl-2 font-semibold ${
                          aluno.mediaAnual !== null && aluno.mediaAnual < 6
                            ? "text-rose-700"
                            : "text-slate-900"
                        }`}
                      >
                        {formatNota(aluno.mediaAnual)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <CardTitle>Sem turmas vinculadas</CardTitle>
          <CardDescription>
            Aguarde a atribuição docente pelo gestor escolar para consultar o
            desempenho.
          </CardDescription>
        </Card>
      )}
    </>
  );
}
