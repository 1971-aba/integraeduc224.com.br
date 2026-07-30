"use server";

import { revalidatePath } from "next/cache";

import { isDevSessionActive, requireRole } from "@/lib/auth";
import {
  devEntradasAlunos,
  devFolgasEscolares,
} from "@/lib/dev-gestor-modulos";
import type { EntradaAluno, FolgaEscolar } from "@/lib/gestor-modulos-types";
import { getMatriculasEntradaEscola } from "@/lib/gestor-entrada-feriados";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean };

async function getGestorEscolaId() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return { error: "Escola não vinculada ao gestor." as const };
  }

  return { profile, escolaId: profile.escola_id };
}

export async function listEntradasHoje(escolaId: string, data?: string) {
  await requireRole(["gestor_escolar", "admin_sme"]);
  const hoje = data ?? new Date().toISOString().slice(0, 10);

  if (await isDevSessionActive()) {
    return devEntradasAlunos.filter(
      (item) => item.escolaId === escolaId && item.data === hoje,
    );
  }

  const supabase = await createClient();
  const { data: entradas, error } = await supabase
    .from("entradas_alunos")
    .select("*")
    .eq("escola_id", escolaId)
    .eq("data", hoje);

  if (error) {
    return devEntradasAlunos.filter(
      (item) => item.escolaId === escolaId && item.data === hoje,
    );
  }

  const matriculas = await getMatriculasEntradaEscola(escolaId);
  const matriculaMap = new Map(
    matriculas.map((m) => [m.matriculaId, m]),
  );

  return (
    entradas?.map((item) => {
      const info = matriculaMap.get(item.matricula_id);
      return {
        id: item.id,
        escolaId: item.escola_id,
        matriculaId: item.matricula_id,
        alunoNome: info?.alunoNome ?? "Aluno",
        turmaNome: info?.turmaNome ?? "—",
        turmaSerie: info?.turmaSerie ?? "—",
        data: item.data,
        hora: item.hora,
      } satisfies EntradaAluno;
    }) ?? []
  );
}

export async function registrarEntradaAluno(
  matriculaId: string,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  const hoje = new Date().toISOString().slice(0, 10);
  const hora = new Date().toTimeString().slice(0, 8);
  const matriculas = await getMatriculasEntradaEscola(ctx.escolaId);
  const matricula = matriculas.find((m) => m.matriculaId === matriculaId);

  if (!matricula) {
    return { error: "Matrícula não encontrada nesta escola." };
  }

  if (await isDevSessionActive()) {
    const existente = devEntradasAlunos.find(
      (e) => e.matriculaId === matriculaId && e.data === hoje,
    );
    if (existente) return { error: "Entrada já registrada hoje." };

    devEntradasAlunos.unshift({
      id: crypto.randomUUID(),
      escolaId: ctx.escolaId,
      matriculaId,
      alunoNome: matricula.alunoNome,
      turmaNome: matricula.turmaNome,
      turmaSerie: matricula.turmaSerie,
      data: hoje,
      hora,
    });
    revalidatePath("/gestor/entrada-alunos");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("entradas_alunos").insert({
    escola_id: ctx.escolaId,
    matricula_id: matriculaId,
    data: hoje,
    hora,
    registrado_por: ctx.profile.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Entrada já registrada hoje." };
    }
    devEntradasAlunos.unshift({
      id: crypto.randomUUID(),
      escolaId: ctx.escolaId,
      matriculaId,
      alunoNome: matricula.alunoNome,
      turmaNome: matricula.turmaNome,
      turmaSerie: matricula.turmaSerie,
      data: hoje,
      hora,
    });
    revalidatePath("/gestor/entrada-alunos");
    return { success: true };
  }

  revalidatePath("/gestor/entrada-alunos");
  return { success: true };
}

export async function listFolgasEscola(escolaId: string): Promise<FolgaEscolar[]> {
  await requireRole(["gestor_escolar", "admin_sme"]);

  if (await isDevSessionActive()) {
    return devFolgasEscolares
      .filter((item) => item.escolaId === escolaId)
      .sort((a, b) => b.dataInicio.localeCompare(a.dataInicio));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("folgas_escolares")
    .select("*")
    .eq("escola_id", escolaId)
    .order("data_inicio", { ascending: false });

  if (error) {
    return devFolgasEscolares.filter((item) => item.escolaId === escolaId);
  }

  return (
    data?.map((item) => ({
      id: item.id,
      escolaId: item.escola_id,
      titulo: item.titulo,
      dataInicio: item.data_inicio,
      dataFim: item.data_fim,
      descricao: item.descricao,
      createdAt: item.created_at,
    })) ?? []
  );
}

export async function criarFolgaEscolar(
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  const titulo = String(formData.get("titulo") ?? "").trim();
  const dataInicio = String(formData.get("data_inicio") ?? "").trim();
  const dataFim = String(formData.get("data_fim") ?? "").trim() || dataInicio;
  const descricao = String(formData.get("descricao") ?? "").trim() || null;

  if (!titulo) return { error: "Informe o título." };
  if (!dataInicio) return { error: "Informe a data de início." };

  if (await isDevSessionActive()) {
    devFolgasEscolares.unshift({
      id: crypto.randomUUID(),
      escolaId: ctx.escolaId,
      titulo,
      dataInicio,
      dataFim,
      descricao,
      createdAt: new Date().toISOString(),
    });
    revalidatePath("/gestor/feriados");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("folgas_escolares").insert({
    escola_id: ctx.escolaId,
    titulo,
    data_inicio: dataInicio,
    data_fim: dataFim,
    descricao,
    created_by: ctx.profile.id,
  });

  if (error) {
    devFolgasEscolares.unshift({
      id: crypto.randomUUID(),
      escolaId: ctx.escolaId,
      titulo,
      dataInicio,
      dataFim,
      descricao,
      createdAt: new Date().toISOString(),
    });
    revalidatePath("/gestor/feriados");
    return { success: true };
  }

  revalidatePath("/gestor/feriados");
  return { success: true };
}

export async function excluirFolgaEscolar(
  folgaId: string,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  if (await isDevSessionActive()) {
    const index = devFolgasEscolares.findIndex(
      (item) => item.id === folgaId && item.escolaId === ctx.escolaId,
    );
    if (index >= 0) devFolgasEscolares.splice(index, 1);
    revalidatePath("/gestor/feriados");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("folgas_escolares")
    .delete()
    .eq("id", folgaId)
    .eq("escola_id", ctx.escolaId);

  if (error) return { error: "Não foi possível excluir a folga." };

  revalidatePath("/gestor/feriados");
  return { success: true };
}
