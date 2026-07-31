"use server";

import { revalidatePath } from "next/cache";

import { isDevSessionActive, requireRole } from "@/lib/auth";
import {
  devOcorrencias,
  devReunioes,
} from "@/lib/dev-gestor-modulos";
import type {
  OcorrenciaCategoria,
  OcorrenciaStatus,
  OcorrenciaTipo,
  ReuniaoTipo,
} from "@/lib/gestor-modulos-types";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean };

async function getGestorEscolaId() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (profile.role === "gestor_escolar" && !profile.escola_id) {
    return { error: "Escola não vinculada ao gestor." as const };
  }

  return { profile, escolaId: profile.escola_id! };
}

function revalidateReunioes() {
  revalidatePath("/gestor/reunioes");
}

function revalidateOcorrencias() {
  revalidatePath("/gestor/ocorrencias");
  revalidatePath("/gestor/ocorrencias/alunos");
  revalidatePath("/gestor/ocorrencias/estrutura");
  revalidatePath("/gestor/ocorrencias/estrutura/informar");
  revalidatePath("/gestor/ocorrencias/estrutura/atendidas");
}

export async function listReunioesEscola(escolaId: string) {
  await requireRole(["gestor_escolar", "admin_sme", "coordenador"]);

  if (await isDevSessionActive()) {
    return devReunioes
      .filter((item) => item.escolaId === escolaId)
      .sort((a, b) => b.data.localeCompare(a.data));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reunioes_escolares")
    .select("*")
    .eq("escola_id", escolaId)
    .order("data", { ascending: false });

  if (error) {
    return devReunioes
      .filter((item) => item.escolaId === escolaId)
      .sort((a, b) => b.data.localeCompare(a.data));
  }

  return (
    data?.map((item) => ({
      id: item.id,
      escolaId: item.escola_id,
      anoLetivoId: item.ano_letivo_id,
      titulo: item.titulo,
      data: item.data,
      hora: item.hora,
      local: item.local,
      descricao: item.descricao,
      tipo: item.tipo as ReuniaoTipo,
      createdAt: item.created_at,
    })) ?? []
  );
}

export async function criarReuniaoEscolar(
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  const titulo = String(formData.get("titulo") ?? "").trim();
  const data = String(formData.get("data") ?? "").trim();
  const hora = String(formData.get("hora") ?? "").trim() || null;
  const local = String(formData.get("local") ?? "").trim() || null;
  const descricao = String(formData.get("descricao") ?? "").trim() || null;
  const tipo = String(formData.get("tipo") ?? "reuniao_pedagogica") as ReuniaoTipo;

  if (!titulo) return { error: "Informe o título da reunião." };
  if (!data) return { error: "Informe a data." };

  if (await isDevSessionActive()) {
    devReunioes.unshift({
      id: crypto.randomUUID(),
      escolaId: ctx.escolaId,
      anoLetivoId: null,
      titulo,
      data,
      hora,
      local,
      descricao,
      tipo,
      createdAt: new Date().toISOString(),
    });
    revalidateReunioes();
    return { success: true };
  }

  const supabase = await createClient();

  const { data: anoAtivo } = await supabase
    .from("anos_letivos")
    .select("id")
    .eq("ativo", true)
    .maybeSingle();

  const { error } = await supabase.from("reunioes_escolares").insert({
    escola_id: ctx.escolaId,
    ano_letivo_id: anoAtivo?.id ?? null,
    titulo,
    data,
    hora,
    local,
    descricao,
    tipo,
    created_by: ctx.profile.id,
  });

  if (error) {
    devReunioes.unshift({
      id: crypto.randomUUID(),
      escolaId: ctx.escolaId,
      anoLetivoId: null,
      titulo,
      data,
      hora,
      local,
      descricao,
      tipo,
      createdAt: new Date().toISOString(),
    });
    revalidateReunioes();
    return { success: true };
  }

  revalidateReunioes();
  return { success: true };
}

export async function excluirReuniaoEscolar(
  reuniaoId: string,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  if (await isDevSessionActive()) {
    const index = devReunioes.findIndex(
      (item) => item.id === reuniaoId && item.escolaId === ctx.escolaId,
    );
    if (index >= 0) devReunioes.splice(index, 1);
    revalidateReunioes();
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("reunioes_escolares")
    .delete()
    .eq("id", reuniaoId)
    .eq("escola_id", ctx.escolaId);

  if (error) return { error: "Não foi possível excluir a reunião." };

  revalidateReunioes();
  return { success: true };
}

export async function listOcorrenciasEscola(
  escolaId: string,
  categoria?: OcorrenciaCategoria,
  status?: OcorrenciaStatus,
) {
  await requireRole(["gestor_escolar", "admin_sme", "coordenador"]);

  if (await isDevSessionActive()) {
    return devOcorrencias
      .filter(
        (item) =>
          item.escolaId === escolaId &&
          (!categoria || item.categoria === categoria) &&
          (!status || item.status === status),
      )
      .sort((a, b) => b.data.localeCompare(a.data));
  }

  const supabase = await createClient();
  let query = supabase
    .from("ocorrencias")
    .select("*")
    .eq("escola_id", escolaId);

  if (categoria) {
    query = query.eq("categoria", categoria);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("data", { ascending: false });

  if (error) {
    return devOcorrencias
      .filter(
        (item) =>
          item.escolaId === escolaId &&
          (!categoria || item.categoria === categoria) &&
          (!status || item.status === status),
      )
      .sort((a, b) => b.data.localeCompare(a.data));
  }

  const alunoIds = [
    ...new Set(
      data?.map((item) => item.aluno_id).filter(Boolean) as string[],
    ),
  ];

  const { data: alunos } = alunoIds.length
    ? await supabase.from("alunos").select("id, nome").in("id", alunoIds)
    : { data: [] };

  return (
    data?.map((item) => ({
      id: item.id,
      escolaId: item.escola_id,
      alunoId: item.aluno_id,
      alunoNome:
        alunos?.find((aluno) => aluno.id === item.aluno_id)?.nome ?? null,
      titulo: item.titulo,
      descricao: item.descricao,
      tipo: item.tipo as OcorrenciaTipo,
      categoria: (item.categoria ?? "alunos") as OcorrenciaCategoria,
      status: (item.status ?? "informada") as OcorrenciaStatus,
      data: item.data,
      registradoPor: item.registrado_por,
      createdAt: item.created_at,
    })) ?? []
  );
}

export async function criarOcorrencia(formData: FormData): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const data = String(formData.get("data") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "disciplinar") as OcorrenciaTipo;
  const categoria = String(
    formData.get("categoria") ?? "alunos",
  ) as OcorrenciaCategoria;
  const alunoId =
    categoria === "estrutura"
      ? null
      : String(formData.get("aluno_id") ?? "").trim() || null;

  if (!titulo) return { error: "Informe o título." };
  if (!descricao) return { error: "Informe a descrição." };
  if (!data) return { error: "Informe a data." };

  let alunoNome: string | null = null;
  if (alunoId) {
    const supabase = await createClient();
    const { data: aluno } = await supabase
      .from("alunos")
      .select("nome")
      .eq("id", alunoId)
      .maybeSingle();
    alunoNome = aluno?.nome ?? null;
  }

  if (await isDevSessionActive()) {
    devOcorrencias.unshift({
      id: crypto.randomUUID(),
      escolaId: ctx.escolaId,
      alunoId,
      alunoNome,
      titulo,
      descricao,
      tipo,
      categoria,
      status: "informada",
      data,
      registradoPor: ctx.profile.id,
      createdAt: new Date().toISOString(),
    });
    revalidateOcorrencias();
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("ocorrencias").insert({
    escola_id: ctx.escolaId,
    aluno_id: alunoId,
    titulo,
    descricao,
    tipo,
    categoria,
    status: "informada",
    data,
    registrado_por: ctx.profile.id,
  });

  if (error) {
    devOcorrencias.unshift({
      id: crypto.randomUUID(),
      escolaId: ctx.escolaId,
      alunoId,
      alunoNome,
      titulo,
      descricao,
      tipo,
      categoria,
      status: "informada",
      data,
      registradoPor: ctx.profile.id,
      createdAt: new Date().toISOString(),
    });
    revalidateOcorrencias();
    return { success: true };
  }

  revalidateOcorrencias();
  return { success: true };
}

export async function marcarOcorrenciaAtendida(
  ocorrenciaId: string,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  if (await isDevSessionActive()) {
    const item = devOcorrencias.find(
      (ocorrencia) =>
        ocorrencia.id === ocorrenciaId && ocorrencia.escolaId === ctx.escolaId,
    );
    if (!item) return { error: "Ocorrência não encontrada." };
    item.status = "atendida";
    revalidateOcorrencias();
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("ocorrencias")
    .update({ status: "atendida" })
    .eq("id", ocorrenciaId)
    .eq("escola_id", ctx.escolaId)
    .eq("categoria", "estrutura");

  if (error) return { error: "Não foi possível marcar a ocorrência como atendida." };

  revalidateOcorrencias();
  return { success: true };
}

export async function excluirOcorrencia(
  ocorrenciaId: string,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  if (await isDevSessionActive()) {
    const index = devOcorrencias.findIndex(
      (item) => item.id === ocorrenciaId && item.escolaId === ctx.escolaId,
    );
    if (index >= 0) devOcorrencias.splice(index, 1);
    revalidateOcorrencias();
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("ocorrencias")
    .delete()
    .eq("id", ocorrenciaId)
    .eq("escola_id", ctx.escolaId);

  if (error) return { error: "Não foi possível excluir a ocorrência." };

  revalidateOcorrencias();
  return { success: true };
}
