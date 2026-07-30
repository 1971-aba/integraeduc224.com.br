"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { TIPOS_PROGRAMA_PROJETO } from "@/lib/programas-projetos-config";
import { createClient } from "@/lib/supabase/server";
import type {
  EtapaProgramaProjeto,
  TipoProgramaProjeto,
} from "@/types/database";

type ActionResult = { error?: string; success?: boolean };

function revalidarProgramasProjetos(tipo: TipoProgramaProjeto) {
  const base = `/gestor/alunos/outras-opcoes/programas-projetos/${TIPOS_PROGRAMA_PROJETO[tipo].slug}`;
  revalidatePath(`${base}/fundamental`);
  revalidatePath(`${base}/infantil`);
  revalidatePath(`${base}/vincular`);
  revalidatePath(`${base}/consultar`);
}

async function resolverEscola() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return { error: "Perfil sem escola vinculada." as const };
  }

  return { escolaId: profile.escola_id };
}

function textoOuNulo(formData: FormData, campo: string) {
  const valor = String(formData.get(campo) ?? "").trim();
  return valor.length > 0 ? valor : null;
}

export async function criarProgramaProjeto(
  tipo: TipoProgramaProjeto,
  etapa: EtapaProgramaProjeto,
  formData: FormData,
): Promise<ActionResult> {
  const escola = await resolverEscola();
  if ("error" in escola) return { error: escola.error };

  const nome = String(formData.get("nome") ?? "").trim();

  if (nome.length < 2) {
    return {
      error: `Informe o nome do ${TIPOS_PROGRAMA_PROJETO[tipo].singular.toLowerCase()}.`,
    };
  }

  const dataInicio = textoOuNulo(formData, "data_inicio");
  const dataFim = textoOuNulo(formData, "data_fim");

  if (dataInicio && dataFim && dataFim < dataInicio) {
    return { error: "A data de término não pode ser anterior ao início." };
  }

  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("programas_projetos")
    .select("id")
    .eq("escola_id", escola.escolaId)
    .eq("tipo", tipo)
    .eq("etapa", etapa)
    .ilike("nome", nome)
    .maybeSingle();

  if (existente) {
    return { error: "Já existe um registro com este nome nesta etapa." };
  }

  const { error } = await supabase.from("programas_projetos").insert({
    escola_id: escola.escolaId,
    tipo,
    etapa,
    nome,
    descricao: textoOuNulo(formData, "descricao"),
    responsavel: textoOuNulo(formData, "responsavel"),
    data_inicio: dataInicio,
    data_fim: dataFim,
  });

  if (error) {
    return { error: "Não foi possível cadastrar." };
  }

  revalidarProgramasProjetos(tipo);
  return { success: true };
}

export async function excluirProgramaProjeto(
  tipo: TipoProgramaProjeto,
  id: string,
): Promise<ActionResult> {
  const escola = await resolverEscola();
  if ("error" in escola) return { error: escola.error };

  const supabase = await createClient();

  const { error } = await supabase
    .from("programas_projetos")
    .delete()
    .eq("id", id)
    .eq("escola_id", escola.escolaId);

  if (error) {
    return { error: "Não foi possível excluir." };
  }

  revalidarProgramasProjetos(tipo);
  return { success: true };
}

export async function vincularAlunoProgramaProjeto(
  tipo: TipoProgramaProjeto,
  programaProjetoId: string,
  alunoId: string,
): Promise<ActionResult> {
  const escola = await resolverEscola();
  if ("error" in escola) return { error: escola.error };

  const supabase = await createClient();

  const { data: item } = await supabase
    .from("programas_projetos")
    .select("id")
    .eq("id", programaProjetoId)
    .eq("escola_id", escola.escolaId)
    .maybeSingle();

  if (!item) {
    return { error: "Registro não encontrado nesta escola." };
  }

  const { error } = await supabase.from("programas_projetos_alunos").insert({
    programa_projeto_id: programaProjetoId,
    aluno_id: alunoId,
  });

  if (error) {
    return { error: "Este aluno já está vinculado." };
  }

  revalidarProgramasProjetos(tipo);
  return { success: true };
}

export async function desvincularAlunoProgramaProjeto(
  tipo: TipoProgramaProjeto,
  vinculoId: string,
): Promise<ActionResult> {
  const escola = await resolverEscola();
  if ("error" in escola) return { error: escola.error };

  const supabase = await createClient();

  const { error } = await supabase
    .from("programas_projetos_alunos")
    .delete()
    .eq("id", vinculoId);

  if (error) {
    return { error: "Não foi possível remover o vínculo." };
  }

  revalidarProgramasProjetos(tipo);
  return { success: true };
}
