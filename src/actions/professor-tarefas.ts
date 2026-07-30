"use server";

import { revalidatePath } from "next/cache";

import { isDevSessionActive, requireRole } from "@/lib/auth";
import { devTarefasEscolares } from "@/lib/dev-gestor-modulos";
import type { TarefaEscolar } from "@/lib/gestor-modulos-types";
import { getProfessorAtribuicoes } from "@/lib/diario";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean };

async function getAtribuicaoInfo(atribuicaoId: string, professorId: string) {
  const atribuicoes = await getProfessorAtribuicoes(professorId);
  const atribuicao = atribuicoes.find((item) => item.id === atribuicaoId);
  if (!atribuicao) return null;

  return {
    disciplina: atribuicao.disciplinas?.nome ?? "Disciplina",
    turma: atribuicao.turmas?.nome ?? "Turma",
    serie: atribuicao.turmas?.serie ?? "—",
  };
}

export async function listTarefasProfessor(
  professorId: string,
  atribuicaoId?: string,
): Promise<TarefaEscolar[]> {
  await requireRole(["professor"]);

  if (await isDevSessionActive()) {
    let list = devTarefasEscolares.filter((item) =>
      atribuicaoId ? item.atribuicaoId === atribuicaoId : true,
    );
    return list.sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega));
  }

  const supabase = await createClient();

  const { data: atribuicoes } = await supabase
    .from("atribuicoes_docentes")
    .select("id")
    .eq("professor_id", professorId);

  const ids = atribuicoes?.map((a) => a.id) ?? [];
  if (ids.length === 0) return [];

  let query = supabase
    .from("tarefas_escolares")
    .select("*")
    .in("atribuicao_id", ids)
    .order("data_entrega", { ascending: true });

  if (atribuicaoId) {
    query = query.eq("atribuicao_id", atribuicaoId);
  }

  const { data, error } = await query;

  if (error) {
    return devTarefasEscolares.filter((item) =>
      atribuicaoId ? item.atribuicaoId === atribuicaoId : true,
    );
  }

  const results: TarefaEscolar[] = [];

  for (const item of data ?? []) {
    const info = await getAtribuicaoInfo(item.atribuicao_id, professorId);
    results.push({
      id: item.id,
      atribuicaoId: item.atribuicao_id,
      titulo: item.titulo,
      descricao: item.descricao,
      dataEntrega: item.data_entrega,
      disciplina: info?.disciplina ?? "Disciplina",
      turma: info?.turma ?? "Turma",
      serie: info?.serie ?? "—",
      createdAt: item.created_at,
    });
  }

  return results;
}

export async function criarTarefaEscolar(
  formData: FormData,
): Promise<ActionResult> {
  const { profile } = await requireRole(["professor"]);

  const atribuicaoId = String(formData.get("atribuicao_id") ?? "").trim();
  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const dataEntrega = String(formData.get("data_entrega") ?? "").trim();

  if (!atribuicaoId) return { error: "Selecione a turma." };
  if (!titulo) return { error: "Informe o título." };
  if (!descricao) return { error: "Informe a descrição." };
  if (!dataEntrega) return { error: "Informe a data de entrega." };

  const info = await getAtribuicaoInfo(atribuicaoId, profile.id);
  if (!info) return { error: "Turma não vinculada ao professor." };

  const tarefa: TarefaEscolar = {
    id: crypto.randomUUID(),
    atribuicaoId,
    titulo,
    descricao,
    dataEntrega,
    disciplina: info.disciplina,
    turma: info.turma,
    serie: info.serie,
    createdAt: new Date().toISOString(),
  };

  if (await isDevSessionActive()) {
    devTarefasEscolares.unshift(tarefa);
    revalidatePath("/professor/tarefas");
    return { success: true };
  }

  const supabase = await createClient();
  const { data: atribuicao } = await supabase
    .from("atribuicoes_docentes")
    .select("professor_id")
    .eq("id", atribuicaoId)
    .maybeSingle();

  if (!atribuicao || atribuicao.professor_id !== profile.id) {
    return { error: "Turma não vinculada ao professor." };
  }

  const { error } = await supabase.from("tarefas_escolares").insert({
    atribuicao_id: atribuicaoId,
    titulo,
    descricao,
    data_entrega: dataEntrega,
    created_by: profile.id,
  });

  if (error) {
    devTarefasEscolares.unshift(tarefa);
    revalidatePath("/professor/tarefas");
    return { success: true };
  }

  revalidatePath("/professor/tarefas");
  return { success: true };
}

export async function excluirTarefaEscolar(
  tarefaId: string,
): Promise<ActionResult> {
  const { profile } = await requireRole(["professor"]);

  if (await isDevSessionActive()) {
    const index = devTarefasEscolares.findIndex((item) => item.id === tarefaId);
    if (index >= 0) devTarefasEscolares.splice(index, 1);
    revalidatePath("/professor/tarefas");
    return { success: true };
  }

  const supabase = await createClient();

  const { data: tarefa } = await supabase
    .from("tarefas_escolares")
    .select("atribuicao_id")
    .eq("id", tarefaId)
    .maybeSingle();

  if (!tarefa) return { error: "Tarefa não encontrada." };

  const { data: atribuicao } = await supabase
    .from("atribuicoes_docentes")
    .select("professor_id")
    .eq("id", tarefa.atribuicao_id)
    .maybeSingle();

  if (!atribuicao || atribuicao.professor_id !== profile.id) {
    return { error: "Sem permissão para excluir esta tarefa." };
  }

  const { error } = await supabase
    .from("tarefas_escolares")
    .delete()
    .eq("id", tarefaId);

  if (error) return { error: "Não foi possível excluir a tarefa." };

  revalidatePath("/professor/tarefas");
  return { success: true };
}
