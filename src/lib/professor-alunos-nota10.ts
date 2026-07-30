import { createClient } from "@/lib/supabase/server";
import { getBimestres, getMatriculasAtivas, getProfessorAtribuicoes } from "@/lib/diario";
import { calcMediaBimestre } from "@/lib/diario-utils";

export type AlunoNotaDez = {
  matriculaId: string;
  alunoNome: string;
  turma: string;
  serie: string;
  disciplina: string;
  bimestre: number | null;
  nota: number;
  atribuicaoId: string;
};

export async function getAlunosNotaDez(
  professorId: string,
  bimestreId?: string,
): Promise<AlunoNotaDez[]> {
  const supabase = await createClient();
  const atribuicoes = await getProfessorAtribuicoes(professorId);
  const ativas = atribuicoes.filter((item) => item.anos_letivos?.ativo);
  const resultados: AlunoNotaDez[] = [];

  for (const atribuicao of ativas) {
    const turma = atribuicao.turmas;
    const disciplina = atribuicao.disciplinas?.nome ?? "Disciplina";
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

export async function getBimestresProfessor(professorId: string) {
  const atribuicoes = await getProfessorAtribuicoes(professorId);
  const map = new Map<string, { id: string; numero: number }>();

  for (const item of atribuicoes) {
    const anoId = item.anos_letivos?.id;
    if (!anoId) continue;
    const bimestres = await getBimestres(anoId);
    for (const b of bimestres) {
      map.set(b.id, { id: b.id, numero: b.numero });
    }
  }

  return [...map.values()].sort((a, b) => a.numero - b.numero);
}
