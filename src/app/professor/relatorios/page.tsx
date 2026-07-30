import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { RelatorioIndividualView } from "@/components/professor/relatorio-individual-view";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getProfessorAtribuicoes } from "@/lib/diario";
import {
  getAlunosAtribuicao,
  getRelatorioIndividualAluno,
} from "@/lib/professor-relatorio-individual";
import { createClient } from "@/lib/supabase/server";

export default async function ProfessorRelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string; aluno?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["professor"]);

  const atribuicoes = await getProfessorAtribuicoes(profile.id);
  const atribuicoesAtivas = atribuicoes.filter(
    (item) => item.anos_letivos?.ativo,
  );

  const atribuicaoId = params.turma ?? atribuicoesAtivas[0]?.id;
  const alunos = atribuicaoId
    ? await getAlunosAtribuicao(atribuicaoId, profile.id)
    : [];

  const matriculaId = params.aluno ?? alunos[0]?.matriculaId;
  const relatorio =
    atribuicaoId && matriculaId
      ? await getRelatorioIndividualAluno(
          atribuicaoId,
          matriculaId,
          profile.id,
        )
      : null;

  const supabase = await createClient();
  const { data: escola } = profile.escola_id
    ? await supabase
        .from("escolas")
        .select("nome")
        .eq("id", profile.escola_id)
        .maybeSingle()
    : { data: null };

  return (
    <>
      <GestorPageHeader
        title="Relatórios Individuais"
        description="Ficha de desempenho e frequência por estudante"
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
                  {item.disciplinas?.nome} — {item.turmas?.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="aluno"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Aluno
            </label>
            <select
              id="aluno"
              name="aluno"
              defaultValue={matriculaId ?? ""}
              className="h-10 min-w-[220px] rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              {alunos.map((aluno) => (
                <option key={aluno.matriculaId} value={aluno.matriculaId}>
                  {aluno.nome}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399]"
          >
            Gerar relatório
          </button>
        </form>
      ) : null}

      {relatorio ? (
        <RelatorioIndividualView
          relatorio={relatorio}
          escolaNome={escola?.nome ?? "Unidade Escolar"}
        />
      ) : (
        <Card>
          <CardTitle>Relatório indisponível</CardTitle>
          <CardDescription>
            Selecione uma turma vinculada e um aluno matriculado.
          </CardDescription>
        </Card>
      )}
    </>
  );
}
