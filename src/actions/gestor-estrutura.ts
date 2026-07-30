"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean };

const TURNOS_VALIDOS = ["manha", "tarde", "noite", "integral"] as const;

type GestorProfile = Awaited<ReturnType<typeof requireRole>>["profile"];

function parseTurmaFields(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const serie = String(formData.get("serie") ?? "").trim();
  const turno = String(formData.get("turno") ?? "").trim().toLowerCase();
  const anoLetivoId = String(formData.get("ano_letivo_id") ?? "").trim();

  if (!nome || nome.length < 2) {
    return { error: "Informe o nome da turma (ex.: 5º A)." };
  }

  if (!serie || serie.length < 2) {
    return { error: "Informe a série (ex.: 5º ano)." };
  }

  if (!TURNOS_VALIDOS.includes(turno as (typeof TURNOS_VALIDOS)[number])) {
    return { error: "Selecione um turno válido." };
  }

  if (!anoLetivoId) {
    return { error: "Selecione o ano letivo." };
  }

  return { nome, serie, turno, anoLetivoId };
}

async function validarTurmaAcesso(turmaId: string, profile: GestorProfile) {
  if (!profile.secretaria_id) {
    return { error: "Perfil sem secretaria vinculada." };
  }

  const supabase = await createClient();
  const { data: turma } = await supabase
    .from("turmas")
    .select("id, escola_id, ano_letivo_id, nome, serie, turno")
    .eq("id", turmaId)
    .maybeSingle();

  if (!turma) {
    return { error: "Turma não encontrada." };
  }

  const escolaCheck = await validarEscolaDoGestor(
    turma.escola_id,
    profile.secretaria_id,
    profile.escola_id,
    profile.role,
  );

  if ("error" in escolaCheck && escolaCheck.error) {
    return { error: escolaCheck.error };
  }

  return { turma };
}

async function validarDisciplinaAcesso(
  disciplinaId: string,
  profile: GestorProfile,
) {
  if (!profile.secretaria_id) {
    return { error: "Perfil sem secretaria vinculada." };
  }

  const supabase = await createClient();
  const { data: disciplina } = await supabase
    .from("disciplinas")
    .select("id, nome, secretaria_id")
    .eq("id", disciplinaId)
    .maybeSingle();

  if (!disciplina) {
    return { error: "Disciplina não encontrada." };
  }

  if (disciplina.secretaria_id !== profile.secretaria_id) {
    return { error: "Disciplina fora da sua rede." };
  }

  return { disciplina };
}

function revalidateEstruturaPaths() {
  revalidatePath("/gestor/turmas");
  revalidatePath("/gestor/atribuicoes");
  revalidatePath("/gestor/alunos");
  revalidatePath("/gestor/alunos/novo");
}

async function validarEscolaDoGestor(
  escolaId: string,
  secretariaId: string,
  profileEscolaId: string | null,
  role: string,
) {
  if (role === "gestor_escolar") {
    if (!profileEscolaId || profileEscolaId !== escolaId) {
      return { error: "Turma deve pertencer à sua escola." };
    }
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

  if (escola.secretaria_id !== secretariaId) {
    return { error: "Escola fora da sua rede." };
  }

  return { escola };
}

export async function criarTurma(formData: FormData): Promise<ActionResult> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  const parsed = parseTurmaFields(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { nome, serie, turno, anoLetivoId } = parsed;

  let escolaId =
    profile.role === "gestor_escolar"
      ? profile.escola_id
      : String(formData.get("escola_id") ?? "").trim();

  if (!escolaId) {
    return { error: "Escola não informada." };
  }

  if (!profile.secretaria_id) {
    return { error: "Perfil sem secretaria vinculada." };
  }

  const escolaCheck = await validarEscolaDoGestor(
    escolaId,
    profile.secretaria_id,
    profile.escola_id,
    profile.role,
  );

  if ("error" in escolaCheck && escolaCheck.error) {
    return { error: escolaCheck.error };
  }

  const supabase = await createClient();

  const { data: anoLetivo } = await supabase
    .from("anos_letivos")
    .select("id")
    .eq("id", anoLetivoId)
    .maybeSingle();

  if (!anoLetivo) {
    return { error: "Ano letivo inválido." };
  }

  const { data: existente } = await supabase
    .from("turmas")
    .select("id")
    .eq("escola_id", escolaId)
    .eq("ano_letivo_id", anoLetivoId)
    .ilike("nome", nome)
    .maybeSingle();

  if (existente) {
    return { error: "Já existe uma turma com este nome neste ano letivo." };
  }

  const { error } = await supabase.from("turmas").insert({
    escola_id: escolaId,
    ano_letivo_id: anoLetivoId,
    nome,
    serie,
    turno,
  });

  if (error) {
    return { error: "Não foi possível cadastrar a turma." };
  }

  revalidateEstruturaPaths();
  return { success: true };
}

export async function atualizarTurma(
  turmaId: string,
  formData: FormData,
): Promise<ActionResult> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  const access = await validarTurmaAcesso(turmaId, profile);
  if ("error" in access && access.error) {
    return { error: access.error };
  }

  const parsed = parseTurmaFields(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { nome, serie, turno, anoLetivoId } = parsed;
  const turma = access.turma!;
  const supabase = await createClient();

  const { data: anoLetivo } = await supabase
    .from("anos_letivos")
    .select("id")
    .eq("id", anoLetivoId)
    .maybeSingle();

  if (!anoLetivo) {
    return { error: "Ano letivo inválido." };
  }

  const { data: existente } = await supabase
    .from("turmas")
    .select("id")
    .eq("escola_id", turma.escola_id)
    .eq("ano_letivo_id", anoLetivoId)
    .ilike("nome", nome)
    .neq("id", turmaId)
    .maybeSingle();

  if (existente) {
    return { error: "Já existe uma turma com este nome neste ano letivo." };
  }

  const { error } = await supabase
    .from("turmas")
    .update({ nome, serie, turno, ano_letivo_id: anoLetivoId })
    .eq("id", turmaId);

  if (error) {
    return { error: "Não foi possível atualizar a turma." };
  }

  revalidateEstruturaPaths();
  return { success: true };
}

export async function excluirTurma(turmaId: string): Promise<ActionResult> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  const access = await validarTurmaAcesso(turmaId, profile);
  if ("error" in access && access.error) {
    return { error: access.error };
  }

  const supabase = await createClient();

  const [{ count: matriculas }, { count: atribuicoes }] = await Promise.all([
    supabase
      .from("matriculas")
      .select("id", { count: "exact", head: true })
      .eq("turma_id", turmaId),
    supabase
      .from("atribuicoes_docentes")
      .select("id", { count: "exact", head: true })
      .eq("turma_id", turmaId),
  ]);

  if ((matriculas ?? 0) > 0) {
    return {
      error:
        "Não é possível excluir: há alunos matriculados nesta turma.",
    };
  }

  if ((atribuicoes ?? 0) > 0) {
    return {
      error:
        "Não é possível excluir: há professores atribuídos a esta turma.",
    };
  }

  const { error } = await supabase.from("turmas").delete().eq("id", turmaId);

  if (error) {
    return { error: "Não foi possível excluir a turma." };
  }

  revalidateEstruturaPaths();
  return { success: true };
}

export async function criarDisciplina(formData: FormData): Promise<ActionResult> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  const nome = String(formData.get("nome") ?? "").trim();

  if (!nome || nome.length < 2) {
    return { error: "Informe o nome da disciplina." };
  }

  if (!profile.secretaria_id) {
    return { error: "Perfil sem secretaria vinculada." };
  }

  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("disciplinas")
    .select("id")
    .eq("secretaria_id", profile.secretaria_id)
    .ilike("nome", nome)
    .maybeSingle();

  if (existente) {
    return { error: "Esta disciplina já está cadastrada na rede." };
  }

  const { error } = await supabase.from("disciplinas").insert({
    secretaria_id: profile.secretaria_id,
    nome,
  });

  if (error) {
    return { error: "Não foi possível cadastrar a disciplina." };
  }

  revalidateEstruturaPaths();
  return { success: true };
}

export async function atualizarDisciplina(
  disciplinaId: string,
  formData: FormData,
): Promise<ActionResult> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  const access = await validarDisciplinaAcesso(disciplinaId, profile);
  if ("error" in access && access.error) {
    return { error: access.error };
  }

  const nome = String(formData.get("nome") ?? "").trim();

  if (!nome || nome.length < 2) {
    return { error: "Informe o nome da disciplina." };
  }

  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("disciplinas")
    .select("id")
    .eq("secretaria_id", profile.secretaria_id!)
    .ilike("nome", nome)
    .neq("id", disciplinaId)
    .maybeSingle();

  if (existente) {
    return { error: "Esta disciplina já está cadastrada na rede." };
  }

  const { error } = await supabase
    .from("disciplinas")
    .update({ nome })
    .eq("id", disciplinaId);

  if (error) {
    return { error: "Não foi possível atualizar a disciplina." };
  }

  revalidateEstruturaPaths();
  return { success: true };
}

export async function excluirDisciplina(
  disciplinaId: string,
): Promise<ActionResult> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  const access = await validarDisciplinaAcesso(disciplinaId, profile);
  if ("error" in access && access.error) {
    return { error: access.error };
  }

  const supabase = await createClient();

  const { count: atribuicoes } = await supabase
    .from("atribuicoes_docentes")
    .select("id", { count: "exact", head: true })
    .eq("disciplina_id", disciplinaId);

  if ((atribuicoes ?? 0) > 0) {
    return {
      error:
        "Não é possível excluir: há professores atribuídos a esta disciplina.",
    };
  }

  const { error } = await supabase
    .from("disciplinas")
    .delete()
    .eq("id", disciplinaId);

  if (error) {
    return { error: "Não foi possível excluir a disciplina." };
  }

  revalidateEstruturaPaths();
  return { success: true };
}
