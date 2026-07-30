import { createClient } from "@/lib/supabase/server";
import { calcularMediaAnual } from "@/lib/diario-utils";
import { getBimestres, getMatriculasAtivas } from "@/lib/diario";

export type DesempenhoAlunoLinha = {
  matriculaId: string;
  nome: string;
  mediasPorBimestre: Record<number, number | null>;
  mediaAnual: number | null;
};

export type DesempenhoTurmaData = {
  atribuicaoId: string;
  disciplina: string;
  turma: string;
  serie: string;
  bimestres: Array<{ id: string; numero: number }>;
  todosBimestres: Array<{ id: string; numero: number }>;
  alunos: DesempenhoAlunoLinha[];
  mediaTurma: number | null;
  aprovados: number;
  reprovados: number;
};

export async function getDesempenhoAtribuicao(
  atribuicaoId: string,
  professorId: string,
  bimestreId?: string,
): Promise<DesempenhoTurmaData | null> {
  const supabase = await createClient();

  const { data: atribuicao } = await supabase
    .from("atribuicoes_docentes")
    .select("id, turma_id, disciplina_id, professor_id")
    .eq("id", atribuicaoId)
    .maybeSingle();

  if (!atribuicao || atribuicao.professor_id !== professorId) {
    return null;
  }

  const [{ data: turma }, { data: disciplina }] = await Promise.all([
    supabase
      .from("turmas")
      .select("id, nome, serie, ano_letivo_id")
      .eq("id", atribuicao.turma_id)
      .maybeSingle(),
    supabase
      .from("disciplinas")
      .select("nome")
      .eq("id", atribuicao.disciplina_id)
      .maybeSingle(),
  ]);

  if (!turma) return null;

  const bimestresDb = await getBimestres(turma.ano_letivo_id);
  const bimestres = bimestresDb.map((b) => ({ id: b.id, numero: b.numero }));
  const bimestreAlvo = bimestreId
    ? bimestresDb.find((b) => b.id === bimestreId)
    : null;

  const matriculas = await getMatriculasAtivas(turma.id);
  const matriculaIds = matriculas.map((m) => m.id);

  const { data: notas } = matriculaIds.length
    ? await supabase
        .from("notas")
        .select(
          "matricula_id, bimestre_id, media_bimestre, nota, recuperacao",
        )
        .eq("atribuicao_id", atribuicao.id)
        .in("matricula_id", matriculaIds)
    : { data: [] };

  const alunos: DesempenhoAlunoLinha[] = matriculas.map((matricula) => {
    const mediasPorBimestre: Record<number, number | null> = {};
    const mediasLista: Array<number | null> = [];

    for (const bimestre of bimestresDb) {
      if (bimestreAlvo && bimestre.id !== bimestreAlvo.id) continue;

      const registro = notas?.find(
        (n) =>
          n.matricula_id === matricula.id && n.bimestre_id === bimestre.id,
      );
      const media =
        registro?.media_bimestre ??
        (registro?.nota != null || registro?.recuperacao != null
          ? Math.max(registro?.nota ?? 0, registro?.recuperacao ?? 0)
          : null);

      mediasPorBimestre[bimestre.numero] = media;
      mediasLista.push(media);
    }

    return {
      matriculaId: matricula.id,
      nome: matricula.alunos?.nome ?? "Aluno",
      mediasPorBimestre,
      mediaAnual: bimestreAlvo
        ? (mediasPorBimestre[bimestreAlvo.numero] ?? null)
        : calcularMediaAnual(mediasLista),
    };
  });

  const mediasGerais = alunos.map((a) => a.mediaAnual);

  return {
    atribuicaoId: atribuicao.id,
    disciplina: disciplina?.nome ?? "Disciplina",
    turma: turma.nome,
    serie: turma.serie,
    bimestres: bimestreAlvo
      ? bimestres.filter((b) => b.id === bimestreAlvo.id)
      : bimestres,
    todosBimestres: bimestres,
    alunos,
    mediaTurma: calcularMediaAnual(mediasGerais),
    aprovados: alunos.filter((a) => a.mediaAnual !== null && a.mediaAnual >= 6)
      .length,
    reprovados: alunos.filter((a) => a.mediaAnual !== null && a.mediaAnual < 6)
      .length,
  };
}
