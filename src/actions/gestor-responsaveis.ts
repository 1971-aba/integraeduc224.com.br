"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { isDevProfileId } from "@/lib/dev-auth";
import { isCpfValido, apenasDigitos } from "@/lib/documentos-aluno-config";
import { isParentesco } from "@/lib/responsaveis-config";
import { createClient } from "@/lib/supabase/server";
import type { ParentescoResponsavel } from "@/types/database";

type ActionResult = { error?: string; success?: boolean };

function textoOuNulo(formData: FormData, campo: string) {
  const valor = String(formData.get(campo) ?? "").trim();
  return valor.length > 0 ? valor : null;
}

function revalidar() {
  revalidatePath("/gestor/alunos/outras-opcoes/complementares/responsaveis");
  revalidatePath("/gestor/alunos/outras-opcoes/pais");
}

async function validarAluno(alunoId: string) {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.secretaria_id) {
    return { error: "Perfil sem secretaria vinculada." as const };
  }

  const supabase = await createClient();
  const { data: aluno } = await supabase
    .from("alunos")
    .select("id, secretaria_id")
    .eq("id", alunoId)
    .maybeSingle();

  if (!aluno || aluno.secretaria_id !== profile.secretaria_id) {
    return { error: "Aluno não encontrado na sua rede." as const };
  }

  return { profile, supabase };
}

type CamposResponsavel = {
  nome: string;
  parentesco: ParentescoResponsavel;
  cpf: string | null;
  rg: string | null;
  telefone: string | null;
  telefone_alt: string | null;
  email: string | null;
  endereco: string | null;
  bairro: string | null;
  cep: string | null;
  local_trabalho: string | null;
  telefone_trabalho: string | null;
  responsavel_legal: boolean;
  autorizado_retirar: boolean;
  observacoes: string | null;
};

function lerCampos(
  formData: FormData,
): { ok: true; campos: CamposResponsavel } | { ok: false; error: string } {
  const nome = String(formData.get("nome") ?? "").trim();
  const parentesco = String(formData.get("parentesco") ?? "").trim();
  const cpfBruto = textoOuNulo(formData, "cpf");
  const cpf = cpfBruto ? apenasDigitos(cpfBruto) : null;

  if (!nome) return { ok: false, error: "Informe o nome do responsável." };
  if (!isParentesco(parentesco)) {
    return { ok: false, error: "Selecione o parentesco." };
  }
  if (cpf && !isCpfValido(cpf)) {
    return { ok: false, error: "CPF do responsável inválido." };
  }

  return {
    ok: true,
    campos: {
      nome,
      parentesco,
      cpf,
      rg: textoOuNulo(formData, "rg"),
      telefone: textoOuNulo(formData, "telefone"),
      telefone_alt: textoOuNulo(formData, "telefone_alt"),
      email: textoOuNulo(formData, "email"),
      endereco: textoOuNulo(formData, "endereco"),
      bairro: textoOuNulo(formData, "bairro"),
      cep: textoOuNulo(formData, "cep"),
      local_trabalho: textoOuNulo(formData, "local_trabalho"),
      telefone_trabalho: textoOuNulo(formData, "telefone_trabalho"),
      responsavel_legal: formData.get("responsavel_legal") === "on",
      autorizado_retirar: formData.get("autorizado_retirar") === "on",
      observacoes: textoOuNulo(formData, "observacoes"),
    },
  };
}

export async function salvarResponsavel(
  alunoId: string,
  formData: FormData,
  responsavelId?: string,
): Promise<ActionResult> {
  const validacao = await validarAluno(alunoId);
  if ("error" in validacao) return { error: validacao.error };

  const lidos = lerCampos(formData);
  if (!lidos.ok) return { error: lidos.error };

  const { campos } = lidos;
  const { profile, supabase } = validacao;
  const atualizadoPor = isDevProfileId(profile.id) ? null : profile.id;

  const payload = {
    aluno_id: alunoId,
    ...campos,
    atualizado_por: atualizadoPor,
    updated_at: new Date().toISOString(),
  };

  const { error } = responsavelId
    ? await supabase
        .from("alunos_responsaveis")
        .update(payload)
        .eq("id", responsavelId)
        .eq("aluno_id", alunoId)
    : await supabase.from("alunos_responsaveis").insert(payload);

  if (error) {
    return { error: "Não foi possível salvar o responsável." };
  }

  // Mantém o atalho legado usado em carteirinha e listagens.
  if (campos.parentesco === "mae") {
    await supabase
      .from("alunos")
      .update({ nome_mae: campos.nome })
      .eq("id", alunoId);
  }

  revalidar();
  return { success: true };
}

export async function excluirResponsavel(
  alunoId: string,
  responsavelId: string,
): Promise<ActionResult> {
  const validacao = await validarAluno(alunoId);
  if ("error" in validacao) return { error: validacao.error };

  const { supabase } = validacao;

  const { error } = await supabase
    .from("alunos_responsaveis")
    .delete()
    .eq("id", responsavelId)
    .eq("aluno_id", alunoId);

  if (error) {
    return { error: "Não foi possível excluir o responsável." };
  }

  revalidar();
  return { success: true };
}
