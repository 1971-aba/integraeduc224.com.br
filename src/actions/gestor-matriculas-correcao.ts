"use server";

import { revalidatePath } from "next/cache";

import { matricularAluno, transferirAluno } from "@/actions/secretaria";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean };

const REVALIDATE_PATHS = [
  "/gestor/corrigir-matriculas",
  "/gestor/alunos",
  "/gestor/relatorios/matriculas",
];

function revalidateMatriculas() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

export async function transferirMatriculaCorrecao(
  alunoId: string,
  matriculaId: string,
  turmaDestinoId: string,
): Promise<ActionResult> {
  await requireRole(["gestor_escolar", "admin_sme"]);

  const result = await transferirAluno(alunoId, matriculaId, turmaDestinoId);
  if (result.error) return { error: result.error };

  revalidateMatriculas();
  return { success: true };
}

export async function cancelarMatriculaCorrecao(
  matriculaId: string,
): Promise<ActionResult> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();

  const { data: matricula } = await supabase
    .from("matriculas")
    .select("id, aluno_id, turma_id, status")
    .eq("id", matriculaId)
    .eq("status", "ativa")
    .maybeSingle();

  if (!matricula) {
    return { error: "Matrícula ativa não encontrada." };
  }

  if (profile.escola_id) {
    const { data: turma } = await supabase
      .from("turmas")
      .select("escola_id")
      .eq("id", matricula.turma_id)
      .maybeSingle();

    if (!turma || turma.escola_id !== profile.escola_id) {
      return { error: "Sem permissão para cancelar esta matrícula." };
    }
  }

  const { error } = await supabase
    .from("matriculas")
    .update({ status: "cancelado" })
    .eq("id", matriculaId);

  if (error) {
    return { error: "Não foi possível cancelar a matrícula." };
  }

  revalidateMatriculas();
  revalidatePath(`/gestor/alunos/${matricula.aluno_id}`);
  return { success: true };
}

export async function atualizarDataMatricula(
  matriculaId: string,
  dataMatricula: string,
): Promise<ActionResult> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();

  if (!dataMatricula) {
    return { error: "Informe a data da matrícula." };
  }

  const { data: matricula } = await supabase
    .from("matriculas")
    .select("id, aluno_id, turma_id")
    .eq("id", matriculaId)
    .maybeSingle();

  if (!matricula) {
    return { error: "Matrícula não encontrada." };
  }

  if (profile.escola_id) {
    const { data: turma } = await supabase
      .from("turmas")
      .select("escola_id")
      .eq("id", matricula.turma_id)
      .maybeSingle();

    if (!turma || turma.escola_id !== profile.escola_id) {
      return { error: "Sem permissão para alterar esta matrícula." };
    }
  }

  const { error } = await supabase
    .from("matriculas")
    .update({ data_matricula: dataMatricula })
    .eq("id", matriculaId);

  if (error) {
    return { error: "Não foi possível atualizar a data." };
  }

  revalidateMatriculas();
  revalidatePath(`/gestor/alunos/${matricula.aluno_id}`);
  return { success: true };
}

export async function matricularAlunoCorrecao(
  alunoId: string,
  turmaId: string,
): Promise<ActionResult> {
  await requireRole(["gestor_escolar", "admin_sme"]);

  const result = await matricularAluno(alunoId, turmaId);
  if (result.error) return { error: result.error };

  revalidateMatriculas();
  return { success: true };
}
