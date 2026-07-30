"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { isTipoFormacao } from "@/lib/professor-formacao-config";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean };

function revalidarFormacao() {
  revalidatePath("/gestor/professores/cursos");
  revalidatePath("/gestor/professores/escola");
}

async function validarProfessor(professorId: string) {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return { error: "Perfil sem escola vinculada." as const };
  }

  const supabase = await createClient();
  const { data: professor } = await supabase
    .from("profiles")
    .select("id, escola_id, role")
    .eq("id", professorId)
    .maybeSingle();

  if (
    !professor ||
    professor.role !== "professor" ||
    professor.escola_id !== profile.escola_id
  ) {
    return { error: "Professor não encontrado nesta escola." as const };
  }

  return { supabase };
}

export async function salvarFormacaoProfessor(
  professorId: string,
  formData: FormData,
): Promise<ActionResult> {
  const validacao = await validarProfessor(professorId);
  if ("error" in validacao) return { error: validacao.error };

  const titulo = String(formData.get("titulo") ?? "").trim();
  const instituicao = String(formData.get("instituicao") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "").trim();
  const cargaBruta = String(formData.get("carga_horaria") ?? "").trim();
  const anoBruto = String(formData.get("ano_conclusao") ?? "").trim();

  if (!titulo) return { error: "Informe o nome do curso ou formação." };
  if (!isTipoFormacao(tipo)) return { error: "Selecione o tipo de formação." };

  const cargaHoraria = cargaBruta ? Number(cargaBruta) : null;
  const anoConclusao = anoBruto ? Number(anoBruto) : null;

  if (
    cargaHoraria !== null &&
    (!Number.isInteger(cargaHoraria) || cargaHoraria <= 0)
  ) {
    return { error: "A carga horária deve ser um número inteiro positivo." };
  }

  if (
    anoConclusao !== null &&
    (!Number.isInteger(anoConclusao) ||
      anoConclusao < 1950 ||
      anoConclusao > new Date().getFullYear())
  ) {
    return { error: "Informe um ano de conclusão válido." };
  }

  const { supabase } = validacao;

  const { error } = await supabase.from("professor_formacao").insert({
    professor_id: professorId,
    titulo,
    instituicao: instituicao || null,
    tipo,
    carga_horaria: cargaHoraria,
    ano_conclusao: anoConclusao,
  });

  if (error) {
    return { error: "Não foi possível salvar a formação." };
  }

  revalidarFormacao();
  return { success: true };
}

export async function excluirFormacaoProfessor(
  formacaoId: string,
): Promise<ActionResult> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return { error: "Perfil sem escola vinculada." };
  }

  const supabase = await createClient();

  const { data: formacao } = await supabase
    .from("professor_formacao")
    .select("id, professor_id")
    .eq("id", formacaoId)
    .maybeSingle();

  if (!formacao) return { error: "Formação não encontrada." };

  const validacao = await validarProfessor(formacao.professor_id);
  if ("error" in validacao) return { error: validacao.error };

  const { error } = await supabase
    .from("professor_formacao")
    .delete()
    .eq("id", formacaoId);

  if (error) {
    return { error: "Não foi possível excluir a formação." };
  }

  revalidarFormacao();
  return { success: true };
}
