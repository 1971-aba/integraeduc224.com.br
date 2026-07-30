"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { isDevProfileId } from "@/lib/dev-auth";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean };

function textoOuNulo(formData: FormData, campo: string) {
  const valor = String(formData.get(campo) ?? "").trim();
  return valor.length > 0 ? valor : null;
}

export async function salvarFichaMedica(
  alunoId: string,
  formData: FormData,
): Promise<ActionResult> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.secretaria_id) {
    return { error: "Perfil sem secretaria vinculada." };
  }

  const supabase = await createClient();

  const { data: aluno } = await supabase
    .from("alunos")
    .select("id, secretaria_id")
    .eq("id", alunoId)
    .maybeSingle();

  if (!aluno || aluno.secretaria_id !== profile.secretaria_id) {
    return { error: "Aluno não encontrado na sua rede." };
  }

  const { error } = await supabase.from("fichas_medicas").upsert(
    {
      aluno_id: alunoId,
      tipo_sanguineo: textoOuNulo(formData, "tipo_sanguineo"),
      alergias: textoOuNulo(formData, "alergias"),
      medicamentos: textoOuNulo(formData, "medicamentos"),
      restricoes_alimentares: textoOuNulo(formData, "restricoes_alimentares"),
      condicoes_saude: textoOuNulo(formData, "condicoes_saude"),
      plano_saude: textoOuNulo(formData, "plano_saude"),
      unidade_saude: textoOuNulo(formData, "unidade_saude"),
      contato_nome: textoOuNulo(formData, "contato_nome"),
      contato_telefone: textoOuNulo(formData, "contato_telefone"),
      observacoes: textoOuNulo(formData, "observacoes"),
      // Perfis de demonstração não existem na tabela profiles.
      atualizado_por: isDevProfileId(profile.id) ? null : profile.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "aluno_id" },
  );

  if (error) {
    return { error: "Não foi possível salvar a ficha médica." };
  }

  revalidatePath("/gestor/alunos/ficha-medica");
  return { success: true };
}
