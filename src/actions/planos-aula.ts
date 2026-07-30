"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { generatePlanoAulaContent } from "@/lib/ai/generate-plano";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean };

export async function gerarPlanoAula(formData: FormData): Promise<ActionResult> {
  const { profile } = await requireRole(["professor"]);

  const tema = String(formData.get("tema") ?? "").trim();
  const serie = String(formData.get("serie") ?? "").trim();
  const disciplina = String(formData.get("disciplina") ?? "").trim();
  const atribuicaoId = String(formData.get("atribuicao_id") ?? "").trim();

  if (!tema || tema.length < 5) {
    return { error: "Informe um tema com pelo menos 5 caracteres." };
  }

  if (!serie) {
    return { error: "Selecione o ano/série." };
  }

  let conteudoIa: string;

  try {
    conteudoIa = await generatePlanoAulaContent({
      tema,
      serie,
      disciplina: disciplina || undefined,
      professorNome: profile.nome,
    });
  } catch (cause) {
    const message =
      cause instanceof Error ? cause.message : "Erro ao gerar plano com IA.";
    return { error: message };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("planos_aula")
    .insert({
      professor_id: profile.id,
      atribuicao_id: atribuicaoId || null,
      tema,
      serie,
      disciplina: disciplina || null,
      conteudo_ia: conteudoIa,
      conteudo_final: conteudoIa,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível salvar o plano gerado." };
  }

  revalidatePath("/professor/planos");
  redirect(`/professor/planos/${data.id}`);
}

export async function salvarPlanoAula(
  planoId: string,
  conteudoFinal: string,
): Promise<ActionResult> {
  const { profile } = await requireRole(["professor"]);

  const texto = conteudoFinal.trim();
  if (texto.length < 20) {
    return { error: "O plano deve ter pelo menos 20 caracteres." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("planos_aula")
    .update({ conteudo_final: texto })
    .eq("id", planoId)
    .eq("professor_id", profile.id);

  if (error) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath(`/professor/planos/${planoId}`);
  revalidatePath("/professor/planos");
  return { success: true };
}

export async function excluirPlanoAula(planoId: string): Promise<ActionResult> {
  const { profile } = await requireRole(["professor"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("planos_aula")
    .delete()
    .eq("id", planoId)
    .eq("professor_id", profile.id);

  if (error) {
    return { error: "Não foi possível excluir o plano." };
  }

  revalidatePath("/professor/planos");
  redirect("/professor/planos");
}
