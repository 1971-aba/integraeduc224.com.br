import { createClient } from "@/lib/supabase/server";
import {
  DEMO_ATRIBUICAO_ID,
  getDemoProfessorAtribuicoes,
  isDevProfileId,
} from "@/lib/dev-auth";

type AtribuicaoResumo = {
  id: string;
  turma_id: string;
  disciplina_id: string;
  ano_letivo_id: string;
  turmas: {
    id: string;
    nome: string;
    serie: string;
    turno: string;
  } | null;
  disciplinas: {
    id: string;
    nome: string;
  } | null;
  anos_letivos: {
    id: string;
    ano: number;
    ativo: boolean;
  } | null;
};

type AtribuicaoDetalhe = AtribuicaoResumo & {
  turma_id: string;
  ano_letivo_id: string;
  disciplina_id: string;
  turmas: {
    id: string;
    nome: string;
    serie: string;
    turno: string;
    escola_id: string;
  } | null;
};

async function mapAtribuicoes(
  rows: Array<{
    id: string;
    turma_id: string;
    disciplina_id: string;
    ano_letivo_id: string;
  }>,
) {
  const supabase = await createClient();

  const [{ data: turmas }, { data: disciplinas }, { data: anos }] =
    await Promise.all([
      supabase.from("turmas").select("id, nome, serie, turno, escola_id"),
      supabase.from("disciplinas").select("id, nome"),
      supabase.from("anos_letivos").select("id, ano, ativo"),
    ]);

  return rows.map((row) => ({
    id: row.id,
    turma_id: row.turma_id,
    ano_letivo_id: row.ano_letivo_id,
    disciplina_id: row.disciplina_id,
    turmas: turmas?.find((turma) => turma.id === row.turma_id) ?? null,
    disciplinas:
      disciplinas?.find((disciplina) => disciplina.id === row.disciplina_id) ??
      null,
    anos_letivos:
      anos?.find((ano) => ano.id === row.ano_letivo_id) ?? null,
  }));
}

export async function getProfessorAtribuicoes(professorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("atribuicoes_docentes")
    .select("id, turma_id, disciplina_id, ano_letivo_id")
    .eq("professor_id", professorId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  const mapped = (await mapAtribuicoes(data ?? [])) as AtribuicaoResumo[];

  if (mapped.length === 0 && isDevProfileId(professorId)) {
    return getDemoProfessorAtribuicoes() as AtribuicaoResumo[];
  }

  return mapped;
}

export async function getAtribuicaoForProfessor(
  atribuicaoId: string,
  professorId: string,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("atribuicoes_docentes")
    .select("id, turma_id, disciplina_id, ano_letivo_id")
    .eq("id", atribuicaoId)
    .eq("professor_id", professorId)
    .maybeSingle();

  if (error || !data) {
    if (
      isDevProfileId(professorId) &&
      atribuicaoId === DEMO_ATRIBUICAO_ID
    ) {
      const [demo] = getDemoProfessorAtribuicoes();
      return {
        ...demo,
        turmas: { ...demo.turmas!, escola_id: "22222222-2222-2222-2222-222222222221" },
      } as AtribuicaoDetalhe;
    }
    return null;
  }

  const [mapped] = await mapAtribuicoes([data]);
  return mapped as AtribuicaoDetalhe;
}

export async function getAtribuicaoForEscola(
  atribuicaoId: string,
  escolaId: string,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("atribuicoes_docentes")
    .select("id, turma_id, disciplina_id, ano_letivo_id")
    .eq("id", atribuicaoId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const [mapped] = await mapAtribuicoes([data]);
  const atribuicao = mapped as AtribuicaoDetalhe;

  if (atribuicao.turmas?.escola_id !== escolaId) {
    return null;
  }

  return atribuicao;
}

export async function getMatriculasAtivas(turmaId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matriculas")
    .select("id, aluno_id")
    .eq("turma_id", turmaId)
    .eq("status", "ativa")
    .order("created_at");

  if (error) throw error;

  const alunoIds = data?.map((item) => item.aluno_id) ?? [];
  const { data: alunos } = alunoIds.length
    ? await supabase.from("alunos").select("id, nome").in("id", alunoIds)
    : { data: [] as Array<{ id: string; nome: string }> };

  return (data ?? [])
    .map((matricula) => ({
      id: matricula.id,
      alunos: alunos?.find((aluno) => aluno.id === matricula.aluno_id) ?? null,
    }))
    .sort((a, b) =>
      (a.alunos?.nome ?? "").localeCompare(b.alunos?.nome ?? "", "pt-BR"),
    );
}

export async function getBimestres(anoLetivoId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bimestres")
    .select("id, numero, data_inicio, data_fim")
    .eq("ano_letivo_id", anoLetivoId)
    .order("numero");

  if (error) throw error;
  return data ?? [];
}

export async function validateDiaLetivo(data: string, anoLetivoId: string) {
  const supabase = await createClient();

  const { data: isValid, error } = await supabase.rpc("is_dia_letivo", {
    p_data: data,
    p_ano_letivo_id: anoLetivoId,
  });

  if (error) throw error;
  return Boolean(isValid);
}
