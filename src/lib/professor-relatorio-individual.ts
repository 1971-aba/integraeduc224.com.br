import { createClient } from "@/lib/supabase/server";
import { calcularMediaAnual } from "@/lib/diario-utils";
import { getBimestres, getMatriculasAtivas } from "@/lib/diario";
import type { PresencaStatus } from "@/types/database";

export type RelatorioIndividualAluno = {
  alunoNome: string;
  matriculaId: string;
  disciplina: string;
  turma: string;
  serie: string;
  bimestres: Array<{ id: string; numero: number }>;
  mediasPorBimestre: Record<number, number | null>;
  mediaAnual: number | null;
  frequencia: {
    totalAulas: number;
    presentes: number;
    faltas: number;
    justificadas: number;
    percentualPresenca: number;
  };
};

function calcularPercentual(presentes: number, total: number) {
  if (total === 0) return 0;
  return Math.round((presentes / total) * 1000) / 10;
}

export async function getRelatorioIndividualAluno(
  atribuicaoId: string,
  matriculaId: string,
  professorId: string,
): Promise<RelatorioIndividualAluno | null> {
  const supabase = await createClient();

  const { data: atribuicao } = await supabase
    .from("atribuicoes_docentes")
    .select("id, turma_id, disciplina_id, professor_id, ano_letivo_id")
    .eq("id", atribuicaoId)
    .maybeSingle();

  if (!atribuicao || atribuicao.professor_id !== professorId) {
    return null;
  }

  const [{ data: turma }, { data: disciplina }, { data: matricula }] =
    await Promise.all([
      supabase
        .from("turmas")
        .select("id, nome, serie")
        .eq("id", atribuicao.turma_id)
        .maybeSingle(),
      supabase
        .from("disciplinas")
        .select("nome")
        .eq("id", atribuicao.disciplina_id)
        .maybeSingle(),
      supabase
        .from("matriculas")
        .select("id, aluno_id")
        .eq("id", matriculaId)
        .eq("turma_id", atribuicao.turma_id)
        .eq("status", "ativa")
        .maybeSingle(),
    ]);

  if (!turma || !matricula) return null;

  const { data: aluno } = await supabase
    .from("alunos")
    .select("nome")
    .eq("id", matricula.aluno_id)
    .maybeSingle();

  const bimestresDb = await getBimestres(atribuicao.ano_letivo_id);
  const bimestres = bimestresDb.map((b) => ({ id: b.id, numero: b.numero }));

  const { data: notas } = await supabase
    .from("notas")
    .select("bimestre_id, media_bimestre, nota, recuperacao")
    .eq("atribuicao_id", atribuicao.id)
    .eq("matricula_id", matriculaId);

  const mediasPorBimestre: Record<number, number | null> = {};
  const mediasLista: Array<number | null> = [];

  for (const bimestre of bimestresDb) {
    const registro = notas?.find((n) => n.bimestre_id === bimestre.id);
    const media =
      registro?.media_bimestre ??
      (registro?.nota != null || registro?.recuperacao != null
        ? Math.max(registro?.nota ?? 0, registro?.recuperacao ?? 0)
        : null);
    mediasPorBimestre[bimestre.numero] = media;
    mediasLista.push(media);
  }

  const { data: chamadas } = await supabase
    .from("chamadas")
    .select("id")
    .eq("atribuicao_id", atribuicao.id);

  const chamadaIds = chamadas?.map((c) => c.id) ?? [];

  const { data: registros } = chamadaIds.length
    ? await supabase
        .from("registros_frequencia")
        .select("status")
        .eq("matricula_id", matriculaId)
        .in("chamada_id", chamadaIds)
    : { data: [] as Array<{ status: PresencaStatus }> };

  const presentes =
    registros?.filter((r) => r.status === "presente").length ?? 0;
  const faltas = registros?.filter((r) => r.status === "falta").length ?? 0;
  const justificadas =
    registros?.filter((r) => r.status === "justificada").length ?? 0;
  const totalAulas = chamadaIds.length;

  return {
    alunoNome: aluno?.nome ?? "Aluno",
    matriculaId,
    disciplina: disciplina?.nome ?? "Disciplina",
    turma: turma.nome,
    serie: turma.serie,
    bimestres,
    mediasPorBimestre,
    mediaAnual: calcularMediaAnual(mediasLista),
    frequencia: {
      totalAulas,
      presentes,
      faltas,
      justificadas,
      percentualPresenca: calcularPercentual(presentes, totalAulas),
    },
  };
}

export async function getAlunosAtribuicao(
  atribuicaoId: string,
  professorId: string,
) {
  const supabase = await createClient();

  const { data: atribuicao } = await supabase
    .from("atribuicoes_docentes")
    .select("turma_id, professor_id")
    .eq("id", atribuicaoId)
    .maybeSingle();

  if (!atribuicao || atribuicao.professor_id !== professorId) {
    return [];
  }

  const matriculas = await getMatriculasAtivas(atribuicao.turma_id);
  return matriculas.map((m) => ({
    matriculaId: m.id,
    nome: m.alunos?.nome ?? "Aluno",
  }));
}
