import { AlunosNotaDezView } from "@/components/professor/alunos-nota-dez-view";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getProfessorAtribuicoes } from "@/lib/diario";
import {
  getAlunosNotaDez,
  getBimestresProfessor,
} from "@/lib/professor-alunos-nota10";

export default async function AlunosNotaDezPage({
  searchParams,
}: {
  searchParams: Promise<{ bimestre?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["professor"]);

  const atribuicoes = await getProfessorAtribuicoes(profile.id);
  const ativas = atribuicoes.filter((item) => item.anos_letivos?.ativo);
  const bimestres = await getBimestresProfessor(profile.id);
  const alunos = await getAlunosNotaDez(profile.id, params.bimestre);

  return (
    <>
      <GestorPageHeader
        title="Aluno nota 10"
        description="Estudantes com desempenho máximo nas suas disciplinas"
      />

      {ativas.length > 0 ? (
        <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
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
              className="h-10 min-w-[180px] rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">Todos os bimestres</option>
              {bimestres.map((bimestre) => (
                <option key={bimestre.id} value={bimestre.id}>
                  {bimestre.numero}º bimestre
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-semibold text-white hover:bg-[#186399]"
          >
            Filtrar
          </button>
        </form>
      ) : (
        <Card className="mb-6">
          <CardTitle>Sem turmas vinculadas</CardTitle>
          <CardDescription>
            Aguarde a atribuição docente para consultar alunos destaque.
          </CardDescription>
        </Card>
      )}

      <AlunosNotaDezView alunos={alunos} />
    </>
  );
}
