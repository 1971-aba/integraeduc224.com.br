"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import {
  DOCUMENTOS_ALUNO,
  isDocumentoAlunoId,
  validarDocumento,
  type DocumentoAluno,
  type DocumentoAlunoId,
} from "@/lib/documentos-aluno-config";
import { isDevProfileId } from "@/lib/dev-auth";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ActionResult = { error?: string; success?: boolean };

export async function salvarDocumentoAluno(
  documentoId: DocumentoAlunoId,
  alunoId: string,
  formData: FormData,
): Promise<ActionResult> {
  if (!isDocumentoAlunoId(documentoId)) {
    return { error: "Documento inválido." };
  }

  const documento = DOCUMENTOS_ALUNO[documentoId];
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

  const validacao = validarDocumento(
    documento,
    String(formData.get("valor") ?? ""),
  );

  if (!validacao.ok) return { error: validacao.error };

  const valor = validacao.valor;

  // Documentos de formato fixo são identificadores únicos: um mesmo número não
  // pode aparecer em dois alunos.
  if (documento.digitos !== null) {
    const duplicado = await buscarDuplicado(documento.coluna, valor, alunoId);
    if (duplicado) {
      return { error: `Este ${documento.nome} já consta em outro aluno.` };
    }
  }

  const atualizadoPor = isDevProfileId(profile.id) ? null : profile.id;

  const error = await gravar(documento, alunoId, valor, {
    atualizadoPor,
    orgaoEmissor: String(formData.get("orgao_emissor") ?? "").trim() || null,
  });

  if (error) {
    return { error: `Não foi possível salvar o ${documento.nome}.` };
  }

  revalidatePath(`/gestor/alunos/outras-opcoes/documentacao/${documentoId}`);
  revalidatePath(`/gestor/alunos/${alunoId}`);

  return { success: true };
}

type Extras = { atualizadoPor: string | null; orgaoEmissor: string | null };

async function gravar(
  documento: DocumentoAluno,
  alunoId: string,
  valor: string,
  extras: Extras,
) {
  const supabase = await createClient();

  if (documento.tabela === "alunos") {
    const payload: Database["public"]["Tables"]["alunos"]["Update"] =
      documento.coluna === "cpf" ? { cpf: valor } : { nis: valor };

    const { error } = await supabase
      .from("alunos")
      .update(payload)
      .eq("id", alunoId);

    return error;
  }

  const payload: Database["public"]["Tables"]["alunos_complementares"]["Insert"] =
    {
      aluno_id: alunoId,
      atualizado_por: extras.atualizadoPor,
      updated_at: new Date().toISOString(),
    };

  switch (documento.id) {
    case "rg":
      payload.rg = valor;
      payload.rg_orgao_emissor = extras.orgaoEmissor;
      break;
    case "rc":
      payload.certidao_nascimento = valor;
      break;
    case "censo":
      payload.codigo_inep = valor;
      break;
    case "sus":
      payload.cartao_sus = valor;
      break;
  }

  const { error } = await supabase
    .from("alunos_complementares")
    .upsert(payload, { onConflict: "aluno_id" });

  return error;
}

/** Procura o mesmo número em outro aluno da rede (a RLS já limita o escopo). */
async function buscarDuplicado(
  coluna: string,
  valor: string,
  alunoId: string,
): Promise<boolean> {
  const supabase = await createClient();

  if (coluna === "cpf" || coluna === "nis") {
    const { data } = await supabase
      .from("alunos")
      .select("id")
      .eq(coluna, valor)
      .neq("id", alunoId)
      .limit(1);

    return (data?.length ?? 0) > 0;
  }

  if (coluna === "codigo_inep" || coluna === "cartao_sus") {
    const { data } = await supabase
      .from("alunos_complementares")
      .select("aluno_id")
      .eq(coluna, valor)
      .neq("aluno_id", alunoId)
      .limit(1);

    return (data?.length ?? 0) > 0;
  }

  return false;
}
