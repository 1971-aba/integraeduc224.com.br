"use server";

import { revalidatePath } from "next/cache";

import { isDevSessionActive, requireRole } from "@/lib/auth";
import { devFrequenciaServidorFaltas } from "@/lib/dev-gestor-modulos";
import type {
  FrequenciaServidorFalta,
  FrequenciaServidorFaltoso,
} from "@/lib/gestor-modulos-types";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean };

const FREQUENCIA_SERVIDOR_PATHS = [
  "/gestor/frequencia-mensal/servidor/lancar",
  "/gestor/frequencia-mensal/servidor/faltosos/2026/3",
  "/gestor/frequencia-mensal/servidor/faltosos/2026/4",
  "/gestor/frequencia-mensal/servidor/faltosos/2026/5",
  "/gestor/frequencia-mensal/servidor/faltosos/2026/6",
  "/gestor/frequencia-mensal/servidor/faltosos/2026/7",
];

function revalidarFrequenciaServidor() {
  for (const path of FREQUENCIA_SERVIDOR_PATHS) revalidatePath(path);
}

async function getGestorEscolaId() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return { error: "Escola não vinculada ao gestor." as const };
  }

  return { profile, escolaId: profile.escola_id };
}

function mapFalta(item: {
  id: string;
  escola_id: string;
  servidor_id: string | null;
  servidor_nome: string;
  data: string;
  observacao: string | null;
  created_at: string;
}): FrequenciaServidorFalta {
  return {
    id: item.id,
    escolaId: item.escola_id,
    servidorId: item.servidor_id,
    servidorNome: item.servidor_nome,
    data: item.data,
    observacao: item.observacao,
    createdAt: item.created_at,
  };
}

export async function listFrequenciaServidorFaltas(
  escolaId: string,
  data?: string,
): Promise<FrequenciaServidorFalta[]> {
  await requireRole(["gestor_escolar", "admin_sme"]);

  if (await isDevSessionActive()) {
    return devFrequenciaServidorFaltas
      .filter(
        (item) =>
          item.escolaId === escolaId && (!data || item.data === data),
      )
      .sort((a, b) => b.data.localeCompare(a.data));
  }

  const supabase = await createClient();
  let query = supabase
    .from("frequencia_servidor_faltas")
    .select("*")
    .eq("escola_id", escolaId);

  if (data) query = query.eq("data", data);

  const { data: rows, error } = await query.order("data", { ascending: false });

  if (error) {
    return devFrequenciaServidorFaltas.filter((item) => item.escolaId === escolaId);
  }

  return rows?.map(mapFalta) ?? [];
}

export async function listFrequenciaServidorFaltosos(
  escolaId: string,
  ano: number,
  mes: number,
): Promise<FrequenciaServidorFaltoso[]> {
  await requireRole(["gestor_escolar", "admin_sme"]);

  const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const fimDate = new Date(ano, mes, 0);
  const fim = `${ano}-${String(mes).padStart(2, "0")}-${String(fimDate.getDate()).padStart(2, "0")}`;

  const faltas = await listFrequenciaServidorFaltasPeriodo(escolaId, inicio, fim);

  const agrupado = new Map<string, FrequenciaServidorFaltoso>();

  for (const falta of faltas) {
    const chave = falta.servidorId ?? falta.servidorNome;
    const atual = agrupado.get(chave) ?? {
      servidorId: falta.servidorId,
      servidorNome: falta.servidorNome,
      totalFaltas: 0,
      datas: [],
    };
    atual.totalFaltas += 1;
    atual.datas.push(falta.data);
    agrupado.set(chave, atual);
  }

  return [...agrupado.values()].sort((a, b) =>
    b.totalFaltas - a.totalFaltas || a.servidorNome.localeCompare(b.servidorNome, "pt-BR"),
  );
}

async function listFrequenciaServidorFaltasPeriodo(
  escolaId: string,
  inicio: string,
  fim: string,
): Promise<FrequenciaServidorFalta[]> {
  if (await isDevSessionActive()) {
    return devFrequenciaServidorFaltas.filter(
      (item) =>
        item.escolaId === escolaId && item.data >= inicio && item.data <= fim,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("frequencia_servidor_faltas")
    .select("*")
    .eq("escola_id", escolaId)
    .gte("data", inicio)
    .lte("data", fim)
    .order("data");

  if (error) {
    return devFrequenciaServidorFaltas.filter(
      (item) =>
        item.escolaId === escolaId && item.data >= inicio && item.data <= fim,
    );
  }

  return data?.map(mapFalta) ?? [];
}

export async function lancarFaltaServidor(
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  const servidorId = String(formData.get("servidor_id") ?? "").trim() || null;
  const servidorNome = String(formData.get("servidor_nome") ?? "").trim();
  const data = String(formData.get("data") ?? "").trim();
  const observacao = String(formData.get("observacao") ?? "").trim() || null;

  if (!data) return { error: "Informe a data." };
  if (!servidorId && !servidorNome) {
    return { error: "Selecione ou informe o servidor." };
  }

  let nomeFinal = servidorNome;
  if (servidorId) {
    const supabase = await createClient();
    const { data: servidor } = await supabase
      .from("profiles")
      .select("nome")
      .eq("id", servidorId)
      .maybeSingle();
    nomeFinal = servidor?.nome ?? servidorNome;
  }

  if (!nomeFinal) return { error: "Servidor não encontrado." };

  const registro: FrequenciaServidorFalta = {
    id: crypto.randomUUID(),
    escolaId: ctx.escolaId,
    servidorId,
    servidorNome: nomeFinal,
    data,
    observacao,
    createdAt: new Date().toISOString(),
  };

  if (await isDevSessionActive()) {
    devFrequenciaServidorFaltas.unshift(registro);
    revalidarFrequenciaServidor();
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("frequencia_servidor_faltas").insert({
    escola_id: ctx.escolaId,
    servidor_id: servidorId,
    servidor_nome: nomeFinal,
    data,
    observacao,
    created_by: ctx.profile.id,
  });

  if (error) {
    devFrequenciaServidorFaltas.unshift(registro);
    revalidarFrequenciaServidor();
    return { success: true };
  }

  revalidarFrequenciaServidor();
  return { success: true };
}

export async function excluirFaltaServidor(
  faltaId: string,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  if (await isDevSessionActive()) {
    const index = devFrequenciaServidorFaltas.findIndex(
      (item) => item.id === faltaId && item.escolaId === ctx.escolaId,
    );
    if (index >= 0) devFrequenciaServidorFaltas.splice(index, 1);
    revalidarFrequenciaServidor();
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("frequencia_servidor_faltas")
    .delete()
    .eq("id", faltaId)
    .eq("escola_id", ctx.escolaId);

  if (error) return { error: "Não foi possível excluir o registro." };

  revalidarFrequenciaServidor();
  return { success: true };
}
