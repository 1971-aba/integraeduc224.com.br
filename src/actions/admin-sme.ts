"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean };

async function getAdminSecretariaId() {
  const { profile } = await requireRole(["admin_sme"]);

  if (!profile.secretaria_id) {
    return { error: "Perfil sem secretaria vinculada." as const };
  }

  return { profile, secretariaId: profile.secretaria_id };
}

function revalidateAdminPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/escolas");
  revalidatePath("/admin/calendario");
  revalidatePath("/gestor/atribuicoes");
  revalidatePath("/gestor/turmas");
}

export async function criarEscola(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminSecretariaId();
  if ("error" in ctx) return { error: ctx.error };

  const nome = String(formData.get("nome") ?? "").trim();
  const inep = String(formData.get("inep") ?? "").trim() || null;
  const endereco = String(formData.get("endereco") ?? "").trim() || null;

  if (!nome || nome.length < 3) {
    return { error: "Informe o nome da escola." };
  }

  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("escolas")
    .select("id")
    .eq("secretaria_id", ctx.secretariaId)
    .ilike("nome", nome)
    .maybeSingle();

  if (existente) {
    return { error: "Já existe uma escola com este nome na rede." };
  }

  const { error } = await supabase.from("escolas").insert({
    secretaria_id: ctx.secretariaId,
    nome,
    inep,
    endereco,
    ativa: true,
  });

  if (error) {
    return { error: "Não foi possível cadastrar a escola." };
  }

  revalidateAdminPaths();
  return { success: true };
}

export async function atualizarEscola(
  escolaId: string,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await getAdminSecretariaId();
  if ("error" in ctx) return { error: ctx.error };

  const nome = String(formData.get("nome") ?? "").trim();
  const inep = String(formData.get("inep") ?? "").trim() || null;
  const endereco = String(formData.get("endereco") ?? "").trim() || null;
  const ativa = formData.get("ativa") === "on";

  if (!nome || nome.length < 3) {
    return { error: "Informe o nome da escola." };
  }

  const supabase = await createClient();

  const { data: escola } = await supabase
    .from("escolas")
    .select("id, secretaria_id")
    .eq("id", escolaId)
    .maybeSingle();

  if (!escola || escola.secretaria_id !== ctx.secretariaId) {
    return { error: "Escola não encontrada." };
  }

  const { data: existente } = await supabase
    .from("escolas")
    .select("id")
    .eq("secretaria_id", ctx.secretariaId)
    .ilike("nome", nome)
    .neq("id", escolaId)
    .maybeSingle();

  if (existente) {
    return { error: "Já existe uma escola com este nome na rede." };
  }

  const { error } = await supabase
    .from("escolas")
    .update({ nome, inep, endereco, ativa })
    .eq("id", escolaId);

  if (error) {
    return { error: "Não foi possível atualizar a escola." };
  }

  revalidateAdminPaths();
  return { success: true };
}

export async function criarAnoLetivo(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminSecretariaId();
  if ("error" in ctx) return { error: ctx.error };

  const ano = Number(String(formData.get("ano") ?? "").trim());
  const definirAtivo = formData.get("ativo") === "on";

  if (!Number.isInteger(ano) || ano < 2000 || ano > 2100) {
    return { error: "Informe um ano letivo válido." };
  }

  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("anos_letivos")
    .select("id")
    .eq("secretaria_id", ctx.secretariaId)
    .eq("ano", ano)
    .maybeSingle();

  if (existente) {
    return { error: "Este ano letivo já está cadastrado." };
  }

  if (definirAtivo) {
    await supabase
      .from("anos_letivos")
      .update({ ativo: false })
      .eq("secretaria_id", ctx.secretariaId);
  }

  const { error } = await supabase.from("anos_letivos").insert({
    secretaria_id: ctx.secretariaId,
    ano,
    ativo: definirAtivo,
  });

  if (error) {
    return { error: "Não foi possível cadastrar o ano letivo." };
  }

  revalidateAdminPaths();
  return { success: true };
}

export async function ativarAnoLetivo(
  anoLetivoId: string,
): Promise<ActionResult> {
  const ctx = await getAdminSecretariaId();
  if ("error" in ctx) return { error: ctx.error };

  const supabase = await createClient();

  const { data: anoLetivo } = await supabase
    .from("anos_letivos")
    .select("id, secretaria_id")
    .eq("id", anoLetivoId)
    .maybeSingle();

  if (!anoLetivo || anoLetivo.secretaria_id !== ctx.secretariaId) {
    return { error: "Ano letivo não encontrado." };
  }

  await supabase
    .from("anos_letivos")
    .update({ ativo: false })
    .eq("secretaria_id", ctx.secretariaId);

  const { error } = await supabase
    .from("anos_letivos")
    .update({ ativo: true })
    .eq("id", anoLetivoId);

  if (error) {
    return { error: "Não foi possível ativar o ano letivo." };
  }

  revalidateAdminPaths();
  return { success: true };
}

export async function criarBimestre(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminSecretariaId();
  if ("error" in ctx) return { error: ctx.error };

  const anoLetivoId = String(formData.get("ano_letivo_id") ?? "").trim();
  const numero = Number(String(formData.get("numero") ?? "").trim());
  const dataInicio = String(formData.get("data_inicio") ?? "").trim();
  const dataFim = String(formData.get("data_fim") ?? "").trim();

  if (!anoLetivoId) {
    return { error: "Selecione o ano letivo." };
  }

  if (!Number.isInteger(numero) || numero < 1 || numero > 4) {
    return { error: "Informe o número do bimestre (1 a 4)." };
  }

  if (!dataInicio || !dataFim) {
    return { error: "Informe as datas de início e fim." };
  }

  if (dataFim < dataInicio) {
    return { error: "A data final deve ser posterior à data inicial." };
  }

  const supabase = await createClient();

  const { data: anoLetivo } = await supabase
    .from("anos_letivos")
    .select("id, secretaria_id")
    .eq("id", anoLetivoId)
    .maybeSingle();

  if (!anoLetivo || anoLetivo.secretaria_id !== ctx.secretariaId) {
    return { error: "Ano letivo inválido." };
  }

  const { data: existente } = await supabase
    .from("bimestres")
    .select("id")
    .eq("ano_letivo_id", anoLetivoId)
    .eq("numero", numero)
    .maybeSingle();

  if (existente) {
    return { error: "Este bimestre já está cadastrado para o ano letivo." };
  }

  const { error } = await supabase.from("bimestres").insert({
    ano_letivo_id: anoLetivoId,
    numero,
    data_inicio: dataInicio,
    data_fim: dataFim,
  });

  if (error) {
    return { error: "Não foi possível cadastrar o bimestre." };
  }

  revalidateAdminPaths();
  return { success: true };
}

export async function criarEventoCalendario(
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await getAdminSecretariaId();
  if ("error" in ctx) return { error: ctx.error };

  const anoLetivoId = String(formData.get("ano_letivo_id") ?? "").trim();
  const titulo = String(formData.get("titulo") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "feriado").trim();
  const dataInicio = String(formData.get("data_inicio") ?? "").trim();
  const dataFim = String(formData.get("data_fim") ?? "").trim() || dataInicio;

  if (!anoLetivoId) {
    return { error: "Selecione o ano letivo." };
  }

  if (!titulo || titulo.length < 2) {
    return { error: "Informe o título do evento." };
  }

  if (!dataInicio) {
    return { error: "Informe a data do evento." };
  }

  if (dataFim < dataInicio) {
    return { error: "A data final deve ser posterior à data inicial." };
  }

  const supabase = await createClient();

  const { data: anoLetivo } = await supabase
    .from("anos_letivos")
    .select("id, secretaria_id")
    .eq("id", anoLetivoId)
    .maybeSingle();

  if (!anoLetivo || anoLetivo.secretaria_id !== ctx.secretariaId) {
    return { error: "Ano letivo inválido." };
  }

  const { error } = await supabase.from("calendario_eventos").insert({
    ano_letivo_id: anoLetivoId,
    titulo,
    tipo,
    data_inicio: dataInicio,
    data_fim: dataFim,
  });

  if (error) {
    return { error: "Não foi possível cadastrar o evento." };
  }

  revalidateAdminPaths();
  return { success: true };
}
