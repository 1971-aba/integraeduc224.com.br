import { createClient } from "@/lib/supabase/server";
import { getEscolaTurmaIds } from "@/lib/coordenador-data";
import { getBimestres, getMatriculasAtivas } from "@/lib/diario";
import { calcMediaBimestre } from "@/lib/diario-utils";
import type { AlunoNotaDez } from "@/lib/professor-alunos-nota10";

export type RankingNotaDezTurma = {
  turmaId: string;
  turma: string;
  serie: string;
  turno: string;
  totalAlunosNotaDez: number;
};

export async function getAlunosNotaDezEscola(
  escolaId: string,
  bimestreId?: string,
): Promise<AlunoNotaDez[]> {
  const supabase = await createClient();
  const turmaIds = await getEscolaTurmaIds(supabase, escolaId);
  if (turmaIds.length === 0) return [];

  const [{ data: atribuicoesRaw }, { data: turmas }, { data: disciplinas }] =
    await Promise.all([
      supabase
        .from("atribuicoes_docentes")
        .select("id, turma_id, disciplina_id, ano_letivo_id")
        .in("turma_id", turmaIds),
      supabase.from("turmas").select("id, nome, serie, turno"),
      supabase.from("disciplinas").select("id, nome"),
    ]);

  const resultados: AlunoNotaDez[] = [];

  for (const atribuicao of atribuicoesRaw ?? []) {
    const turma = turmas?.find((item) => item.id === atribuicao.turma_id);
    const disciplina =
      disciplinas?.find((item) => item.id === atribuicao.disciplina_id)?.nome ??
      "Disciplina";
    if (!turma?.id || !atribuicao.ano_letivo_id) continue;

    const bimestres = await getBimestres(atribuicao.ano_letivo_id);
    const bimestresAlvo = bimestreId
      ? bimestres.filter((b) => b.id === bimestreId)
      : bimestres;

    const matriculas = await getMatriculasAtivas(turma.id);
    if (matriculas.length === 0) continue;

    const { data: notas } = await supabase
      .from("notas")
      .select("matricula_id, bimestre_id, nota, recuperacao, media_bimestre")
      .eq("atribuicao_id", atribuicao.id)
      .in(
        "matricula_id",
        matriculas.map((m) => m.id),
      );

    for (const matricula of matriculas) {
      for (const bimestre of bimestresAlvo) {
        const registro = notas?.find(
          (n) =>
            n.matricula_id === matricula.id &&
            n.bimestre_id === bimestre.id,
        );
        if (!registro) continue;

        const media =
          registro.media_bimestre ??
          calcMediaBimestre(registro.nota, registro.recuperacao);

        if (media !== null && media >= 10) {
          resultados.push({
            matriculaId: matricula.id,
            alunoNome: matricula.alunos?.nome ?? "Aluno",
            turma: turma.nome,
            serie: turma.serie,
            disciplina,
            bimestre: bimestre.numero,
            nota: media,
            atribuicaoId: atribuicao.id,
          });
        }
      }
    }
  }

  return resultados.sort((a, b) => {
    const turma = a.turma.localeCompare(b.turma, "pt-BR");
    if (turma !== 0) return turma;
    return a.alunoNome.localeCompare(b.alunoNome, "pt-BR");
  });
}

export function agruparRankingNotaDezPorTurma(
  alunos: AlunoNotaDez[],
): RankingNotaDezTurma[] {
  const map = new Map<
    string,
    RankingNotaDezTurma & { alunosIds: Set<string> }
  >();

  for (const aluno of alunos) {
    const chave = aluno.turma;
    const atual = map.get(chave) ?? {
      turmaId: chave,
      turma: aluno.turma,
      serie: aluno.serie,
      turno: "",
      totalAlunosNotaDez: 0,
      alunosIds: new Set<string>(),
    };
    atual.alunosIds.add(aluno.matriculaId);
    map.set(chave, atual);
  }

  return [...map.values()]
    .map(({ alunosIds, ...item }) => ({
      ...item,
      totalAlunosNotaDez: alunosIds.size,
    }))
    .sort(
      (a, b) =>
        b.totalAlunosNotaDez - a.totalAlunosNotaDez ||
        a.turma.localeCompare(b.turma, "pt-BR"),
    );
}
