"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { isTipoAtividadeExtra } from "@/lib/extras-config";
import { createClient } from "@/lib/supabase/server";
import type { TipoAtividadeExtra } from "@/types/database";

type ActionResult = { error?: string; success?: boolean };

type GestorProfile = Awaited<ReturnType<typeof requireRole>>["profile"];

const TURNOS_VALIDOS = ["manha", "tarde", "noite", "integral"] as const;

const ROLES_GESTAO = ["gestor_escolar", "admin_sme"] as const;

function revalidarExtras(tipo: TipoAtividadeExtra) {
  const base = `/gestor/turmas/outras-opcoes/${tipo}`;
  for (const rota of [
    "turmas",
    "atividades",
    "professor",
    "alunos",
    "disciplinas",
    "horario",
  ]) {
    revalidatePath(`${base}/${rota}`);
  }
}

function lerTipo(formData: FormData) {
  const tipo = String(formData.get("tipo") ?? "").trim();
  return isTipoAtividadeExtra(tipo) ? tipo : null;
}

/** Escola em que o registro será criado, respeitando o escopo do perfil. */
async function resolverEscola(profile: GestorProfile, formData: FormData) {
  if (!profile.secretaria_id) {
    return { error: "Perfil sem secretaria vinculada." };
  }

  const escolaId =
    profile.role === "gestor_escolar"
      ? profile.escola_id
      : String(formData.get("escola_id") ?? "").trim();

  if (!escolaId) {
    return { error: "Escola não informada." };
  }

  const supabase = await createClient();
  const { data: escola } = await supabase
    .from("escolas")
    .select("id, secretaria_id, ativa")
    .eq("id", escolaId)
    .maybeSingle();

  if (!escola?.ativa) {
    return { error: "Escola não encontrada ou inativa." };
  }

  if (escola.secretaria_id !== profile.secretaria_id) {
    return { error: "Escola fora da sua rede." };
  }

  return { escolaId };
}

/** Garante que a turma extra pertence ao escopo do perfil. */
async function validarTurmaExtra(turmaId: string, profile: GestorProfile) {
  if (!turmaId) {
    return { error: "Turma não informada." };
  }

  const supabase = await createClient();
  const { data: turma } = await supabase
    .from("turmas_extras")
    .select("id, escola_id, tipo")
    .eq("id", turmaId)
    .maybeSingle();

  if (!turma) {
    return { error: "Turma não encontrada." };
  }

  if (
    profile.role === "gestor_escolar" &&
    turma.escola_id !== profile.escola_id
  ) {
    return { error: "Turma fora da sua escola." };
  }

  if (profile.role === "admin_sme") {
    const { data: escola } = await supabase
      .from("escolas")
      .select("secretaria_id")
      .eq("id", turma.escola_id)
      .maybeSingle();

    if (escola?.secretaria_id !== profile.secretaria_id) {
      return { error: "Turma fora da sua rede." };
    }
  }

  return { turma };
}

export async function criarAtividadeExtra(
  formData: FormData,
): Promise<ActionResult> {
  const { profile } = await requireRole([...ROLES_GESTAO]);

  const tipo = lerTipo(formData);
  if (!tipo) return { error: "Tipo de atividade inválido." };

  const nome = String(formData.get("nome") ?? "").trim();
  if (nome.length < 2) {
    return { error: "Informe o nome da atividade." };
  }

  const descricao = String(formData.get("descricao") ?? "").trim();
  const cargaBruta = String(formData.get("carga_horaria_semanal") ?? "").trim();
  const carga = cargaBruta ? Number(cargaBruta) : null;

  if (carga !== null && (!Number.isFinite(carga) || carga <= 0 || carga > 40)) {
    return { error: "Carga horária semanal deve estar entre 1 e 40 horas." };
  }

  const escola = await resolverEscola(profile, formData);
  if ("error" in escola) return { error: escola.error };

  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("atividades_extras")
    .select("id")
    .eq("escola_id", escola.escolaId)
    .eq("tipo", tipo)
    .ilike("nome", nome)
    .maybeSingle();

  if (existente) {
    return { error: "Já existe uma atividade com este nome." };
  }

  const { error } = await supabase.from("atividades_extras").insert({
    escola_id: escola.escolaId,
    tipo,
    nome,
    descricao: descricao || null,
    carga_horaria_semanal: carga,
  });

  if (error) {
    return { error: "Não foi possível cadastrar a atividade." };
  }

  revalidarExtras(tipo);
  return { success: true };
}

export async function excluirAtividadeExtra(
  atividadeId: string,
): Promise<ActionResult> {
  const { profile } = await requireRole([...ROLES_GESTAO]);

  const supabase = await createClient();
  const { data: atividade } = await supabase
    .from("atividades_extras")
    .select("id, escola_id, tipo")
    .eq("id", atividadeId)
    .maybeSingle();

  if (!atividade) return { error: "Atividade não encontrada." };

  if (
    profile.role === "gestor_escolar" &&
    atividade.escola_id !== profile.escola_id
  ) {
    return { error: "Atividade fora da sua escola." };
  }

  const { count } = await supabase
    .from("turmas_extras")
    .select("id", { count: "exact", head: true })
    .eq("atividade_id", atividadeId);

  if ((count ?? 0) > 0) {
    return {
      error: "Não é possível excluir: há turmas vinculadas a esta atividade.",
    };
  }

  const { error } = await supabase
    .from("atividades_extras")
    .delete()
    .eq("id", atividadeId);

  if (error) {
    return { error: "Não foi possível excluir a atividade." };
  }

  revalidarExtras(atividade.tipo);
  return { success: true };
}

export async function criarTurmaExtra(
  formData: FormData,
): Promise<ActionResult> {
  const { profile } = await requireRole([...ROLES_GESTAO]);

  const tipo = lerTipo(formData);
  if (!tipo) return { error: "Tipo de turma inválido." };

  const nome = String(formData.get("nome") ?? "").trim();
  if (nome.length < 2) {
    return { error: "Informe o nome da turma." };
  }

  const turno = String(formData.get("turno") ?? "")
    .trim()
    .toLowerCase();

  if (!TURNOS_VALIDOS.includes(turno as (typeof TURNOS_VALIDOS)[number])) {
    return { error: "Selecione um turno válido." };
  }

  const local = String(formData.get("local") ?? "").trim();
  const atividadeId = String(formData.get("atividade_id") ?? "").trim();

  const escola = await resolverEscola(profile, formData);
  if ("error" in escola) return { error: escola.error };

  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("turmas_extras")
    .select("id")
    .eq("escola_id", escola.escolaId)
    .eq("tipo", tipo)
    .ilike("nome", nome)
    .maybeSingle();

  if (existente) {
    return { error: "Já existe uma turma com este nome." };
  }

  const { error } = await supabase.from("turmas_extras").insert({
    escola_id: escola.escolaId,
    tipo,
    nome,
    turno,
    local: local || null,
    atividade_id: atividadeId || null,
  });

  if (error) {
    return { error: "Não foi possível cadastrar a turma." };
  }

  revalidarExtras(tipo);
  return { success: true };
}

export async function excluirTurmaExtra(
  turmaId: string,
): Promise<ActionResult> {
  const { profile } = await requireRole([...ROLES_GESTAO]);

  const access = await validarTurmaExtra(turmaId, profile);
  if ("error" in access) return { error: access.error };

  const supabase = await createClient();

  const { count } = await supabase
    .from("turmas_extras_alunos")
    .select("id", { count: "exact", head: true })
    .eq("turma_extra_id", turmaId);

  if ((count ?? 0) > 0) {
    return {
      error: "Não é possível excluir: há estudantes vinculados a esta turma.",
    };
  }

  const { error } = await supabase
    .from("turmas_extras")
    .delete()
    .eq("id", turmaId);

  if (error) {
    return { error: "Não foi possível excluir a turma." };
  }

  revalidarExtras(access.turma.tipo);
  return { success: true };
}

export async function definirProfessorTurmaExtra(
  formData: FormData,
): Promise<ActionResult> {
  const { profile } = await requireRole([...ROLES_GESTAO]);

  const turmaId = String(formData.get("turma_extra_id") ?? "").trim();
  const professorId = String(formData.get("professor_id") ?? "").trim();

  const access = await validarTurmaExtra(turmaId, profile);
  if ("error" in access) return { error: access.error };

  const supabase = await createClient();

  if (professorId) {
    const { data: professor } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", professorId)
      .maybeSingle();

    if (professor?.role !== "professor") {
      return { error: "Selecione um professor válido." };
    }
  }

  const { error } = await supabase
    .from("turmas_extras")
    .update({ professor_id: professorId || null })
    .eq("id", turmaId);

  if (error) {
    return { error: "Não foi possível vincular o professor." };
  }

  revalidarExtras(access.turma.tipo);
  return { success: true };
}

export async function vincularAlunoTurmaExtra(
  formData: FormData,
): Promise<ActionResult> {
  const { profile } = await requireRole([...ROLES_GESTAO]);

  const turmaId = String(formData.get("turma_extra_id") ?? "").trim();
  const alunoId = String(formData.get("aluno_id") ?? "").trim();

  if (!alunoId) return { error: "Selecione um estudante." };

  const access = await validarTurmaExtra(turmaId, profile);
  if ("error" in access) return { error: access.error };

  const supabase = await createClient();

  const { error } = await supabase.from("turmas_extras_alunos").insert({
    turma_extra_id: turmaId,
    aluno_id: alunoId,
  });

  if (error) {
    return {
      error: error.code === "23505"
        ? "Este estudante já está nesta turma."
        : "Não foi possível vincular o estudante.",
    };
  }

  revalidarExtras(access.turma.tipo);
  return { success: true };
}

export async function desvincularAlunoTurmaExtra(
  vinculoTurmaId: string,
  alunoId: string,
): Promise<ActionResult> {
  const { profile } = await requireRole([...ROLES_GESTAO]);

  const access = await validarTurmaExtra(vinculoTurmaId, profile);
  if ("error" in access) return { error: access.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("turmas_extras_alunos")
    .delete()
    .eq("turma_extra_id", vinculoTurmaId)
    .eq("aluno_id", alunoId);

  if (error) {
    return { error: "Não foi possível remover o estudante." };
  }

  revalidarExtras(access.turma.tipo);
  return { success: true };
}

export async function vincularDisciplinaTurmaExtra(
  formData: FormData,
): Promise<ActionResult> {
  const { profile } = await requireRole([...ROLES_GESTAO]);

  const turmaId = String(formData.get("turma_extra_id") ?? "").trim();
  const disciplinaId = String(formData.get("disciplina_id") ?? "").trim();

  if (!disciplinaId) return { error: "Selecione uma disciplina." };

  const access = await validarTurmaExtra(turmaId, profile);
  if ("error" in access) return { error: access.error };

  const supabase = await createClient();

  const { error } = await supabase.from("turmas_extras_disciplinas").insert({
    turma_extra_id: turmaId,
    disciplina_id: disciplinaId,
  });

  if (error) {
    return {
      error: error.code === "23505"
        ? "Esta disciplina já está vinculada à turma."
        : "Não foi possível vincular a disciplina.",
    };
  }

  revalidarExtras(access.turma.tipo);
  return { success: true };
}

export async function desvincularDisciplinaTurmaExtra(
  turmaId: string,
  disciplinaId: string,
): Promise<ActionResult> {
  const { profile } = await requireRole([...ROLES_GESTAO]);

  const access = await validarTurmaExtra(turmaId, profile);
  if ("error" in access) return { error: access.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("turmas_extras_disciplinas")
    .delete()
    .eq("turma_extra_id", turmaId)
    .eq("disciplina_id", disciplinaId);

  if (error) {
    return { error: "Não foi possível remover a disciplina." };
  }

  revalidarExtras(access.turma.tipo);
  return { success: true };
}

export async function criarHorarioExtra(
  formData: FormData,
): Promise<ActionResult> {
  const { profile } = await requireRole([...ROLES_GESTAO]);

  const turmaId = String(formData.get("turma_extra_id") ?? "").trim();
  const diaSemana = Number(String(formData.get("dia_semana") ?? "").trim());
  const horaInicio = String(formData.get("hora_inicio") ?? "").trim();
  const horaFim = String(formData.get("hora_fim") ?? "").trim();

  const access = await validarTurmaExtra(turmaId, profile);
  if ("error" in access) return { error: access.error };

  if (!Number.isInteger(diaSemana) || diaSemana < 1 || diaSemana > 5) {
    return { error: "Selecione um dia entre segunda e sexta." };
  }

  if (!horaInicio || !horaFim) {
    return { error: "Informe o horário de início e término." };
  }

  if (horaFim <= horaInicio) {
    return { error: "O término deve ser depois do início." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("horarios_extras").insert({
    turma_extra_id: turmaId,
    dia_semana: diaSemana,
    hora_inicio: horaInicio,
    hora_fim: horaFim,
  });

  if (error) {
    return {
      error: error.code === "23505"
        ? "Já existe um atendimento neste dia e horário para esta turma."
        : "Não foi possível cadastrar o horário.",
    };
  }

  revalidarExtras(access.turma.tipo);
  return { success: true };
}

export async function excluirHorarioExtra(
  horarioId: string,
): Promise<ActionResult> {
  const { profile } = await requireRole([...ROLES_GESTAO]);

  const supabase = await createClient();
  const { data: horario } = await supabase
    .from("horarios_extras")
    .select("id, turma_extra_id")
    .eq("id", horarioId)
    .maybeSingle();

  if (!horario) return { error: "Horário não encontrado." };

  const access = await validarTurmaExtra(horario.turma_extra_id, profile);
  if ("error" in access) return { error: access.error };

  const { error } = await supabase
    .from("horarios_extras")
    .delete()
    .eq("id", horarioId);

  if (error) {
    return { error: "Não foi possível excluir o horário." };
  }

  revalidarExtras(access.turma.tipo);
  return { success: true };
}
