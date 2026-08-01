import type { SupabaseClient } from "@supabase/supabase-js";

import type { ChamadaTipo } from "@/lib/chamada-tipos";
import type { PresencaStatus } from "@/lib/diario-utils";
import {
  getAtribuicaoForEscola,
  getAtribuicaoForProfessor,
  getMatriculasAtivas,
  validateDiaLetivo,
} from "@/lib/diario";
import type { Database } from "@/types/database";

export async function loadChamadaContext(
  supabase: SupabaseClient<Database>,
  atribuicaoId: string,
  professorId: string,
  data: string,
  tipo: ChamadaTipo,
  options?: { permitirCorrecao?: boolean },
) {
  const atribuicao = await getAtribuicaoForProfessor(atribuicaoId, professorId);
  if (!atribuicao) return null;

  const [matriculas, diaLetivo, chamadaExistente] = await Promise.all([
    getMatriculasAtivas(atribuicao.turma_id),
    options?.permitirCorrecao
      ? Promise.resolve(true)
      : validateDiaLetivo(data, atribuicao.ano_letivo_id),
    supabase
      .from("chamadas")
      .select("id, observacao")
      .eq("atribuicao_id", atribuicaoId)
      .eq("data", data)
      .eq("tipo", tipo)
      .maybeSingle(),
  ]);

  const { data: frequencias } = chamadaExistente.data
    ? await supabase
        .from("registros_frequencia")
        .select("matricula_id, status")
        .eq("chamada_id", chamadaExistente.data.id)
    : { data: [] as Array<{ matricula_id: string; status: PresencaStatus }> };

  const alunos = matriculas.map((matricula) => {
    const registro = (frequencias ?? []).find(
      (item) => item.matricula_id === matricula.id,
    );
    return {
      matriculaId: matricula.id,
      nome: matricula.alunos?.nome ?? "Aluno",
      status: (registro?.status ?? "presente") as PresencaStatus,
    };
  });

  return {
    atribuicao,
    alunos,
    diaLetivo,
    observacao: chamadaExistente.data?.observacao ?? "",
    turmaLabel: `${atribuicao.disciplinas?.nome ?? "Disciplina"} — ${atribuicao.turmas?.nome ?? "Turma"}`,
  };
}

export async function loadChamadaContextEscola(
  supabase: SupabaseClient<Database>,
  atribuicaoId: string,
  escolaId: string,
  data: string,
  tipo: ChamadaTipo,
  options?: { permitirCorrecao?: boolean },
) {
  const atribuicao = await getAtribuicaoForEscola(atribuicaoId, escolaId);
  if (!atribuicao) return null;

  const [matriculas, diaLetivo, chamadaExistente] = await Promise.all([
    getMatriculasAtivas(atribuicao.turma_id),
    options?.permitirCorrecao
      ? Promise.resolve(true)
      : validateDiaLetivo(data, atribuicao.ano_letivo_id),
    supabase
      .from("chamadas")
      .select("id, observacao")
      .eq("atribuicao_id", atribuicaoId)
      .eq("data", data)
      .eq("tipo", tipo)
      .maybeSingle(),
  ]);

  const { data: frequencias } = chamadaExistente.data
    ? await supabase
        .from("registros_frequencia")
        .select("matricula_id, status")
        .eq("chamada_id", chamadaExistente.data.id)
    : { data: [] as Array<{ matricula_id: string; status: PresencaStatus }> };

  const alunos = matriculas.map((matricula) => {
    const registro = (frequencias ?? []).find(
      (item) => item.matricula_id === matricula.id,
    );
    return {
      matriculaId: matricula.id,
      nome: matricula.alunos?.nome ?? "Aluno",
      status: (registro?.status ?? "presente") as PresencaStatus,
    };
  });

  return {
    atribuicao,
    alunos,
    diaLetivo,
    observacao: chamadaExistente.data?.observacao ?? "",
    turmaLabel: `${atribuicao.disciplinas?.nome ?? "Disciplina"} — ${atribuicao.turmas?.nome ?? "Turma"}`,
  };
}

export async function listChamadasAtribuicao(
  supabase: SupabaseClient<Database>,
  atribuicaoId: string,
) {
  const { data } = await supabase
    .from("chamadas")
    .select("id, data, tipo, observacao")
    .eq("atribuicao_id", atribuicaoId)
    .order("data", { ascending: false });

  return (data ?? []).map((item) => ({
    id: item.id,
    data: item.data,
    tipo: item.tipo as ChamadaTipo,
    observacao: item.observacao,
  }));
}
