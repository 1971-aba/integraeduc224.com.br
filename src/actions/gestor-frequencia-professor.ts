"use server";

import { revalidatePath } from "next/cache";

import { isDevSessionActive, requireRole } from "@/lib/auth";
import { devFrequenciaProfessorFaltas } from "@/lib/dev-gestor-modulos";
import type {
  FrequenciaProfessorFalta,
  FrequenciaProfessorFaltoso,
} from "@/lib/gestor-modulos-types";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean };

const FREQUENCIA_PROFESSOR_PATHS = [
  "/gestor/frequencia-mensal/professor/lancar",
  "/gestor/frequencia-mensal/professor/faltosos",
];

function revalidarFrequenciaProfessor() {
  for (const path of FREQUENCIA_PROFESSOR_PATHS) revalidatePath(path);
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
  professor_id: string | null;
  professor_nome: string;
  data: string;
  observacao: string | null;
  created_at: string;
}): FrequenciaProfessorFalta {
  return {
    id: item.id,
    escolaId: item.escola_id,
    professorId: item.professor_id,
    professorNome: item.professor_nome,
    data: item.data,
    observacao: item.observacao,
    createdAt: item.created_at,
  };
}

export async function listFrequenciaProfessorFaltas(
  escolaId: string,
  data?: string,
): Promise<FrequenciaProfessorFalta[]> {
  await requireRole(["gestor_escolar", "admin_sme"]);

  if (await isDevSessionActive()) {
    return devFrequenciaProfessorFaltas
      .filter(
        (item) =>
          item.escolaId === escolaId && (!data || item.data === data),
      )
      .sort((a, b) => b.data.localeCompare(a.data));
  }

  const supabase = await createClient();
  let query = supabase
    .from("frequencia_professor_faltas")
    .select("*")
    .eq("escola_id", escolaId);

  if (data) query = query.eq("data", data);

  const { data: rows, error } = await query.order("data", { ascending: false });

  if (error) {
    return devFrequenciaProfessorFaltas.filter(
      (item) => item.escolaId === escolaId,
    );
  }

  return rows?.map(mapFalta) ?? [];
}

export async function listFrequenciaProfessorFaltosos(
  escolaId: string,
  ano: number,
  mes: number,
): Promise<FrequenciaProfessorFaltoso[]> {
  await requireRole(["gestor_escolar", "admin_sme"]);

  const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const fimDate = new Date(ano, mes, 0);
  const fim = `${ano}-${String(mes).padStart(2, "0")}-${String(fimDate.getDate()).padStart(2, "0")}`;

  const faltas = await listFrequenciaProfessorFaltasPeriodo(
    escolaId,
    inicio,
    fim,
  );

  const agrupado = new Map<string, FrequenciaProfessorFaltoso>();

  for (const falta of faltas) {
    const chave = falta.professorId ?? falta.professorNome;
    const atual = agrupado.get(chave) ?? {
      professorId: falta.professorId,
      professorNome: falta.professorNome,
      totalFaltas: 0,
      datas: [],
    };
    atual.totalFaltas += 1;
    atual.datas.push(falta.data);
    agrupado.set(chave, atual);
  }

  return [...agrupado.values()].sort(
    (a, b) =>
      b.totalFaltas - a.totalFaltas ||
      a.professorNome.localeCompare(b.professorNome, "pt-BR"),
  );
}

async function listFrequenciaProfessorFaltasPeriodo(
  escolaId: string,
  inicio: string,
  fim: string,
): Promise<FrequenciaProfessorFalta[]> {
  if (await isDevSessionActive()) {
    return devFrequenciaProfessorFaltas.filter(
      (item) =>
        item.escolaId === escolaId && item.data >= inicio && item.data <= fim,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("frequencia_professor_faltas")
    .select("*")
    .eq("escola_id", escolaId)
    .gte("data", inicio)
    .lte("data", fim)
    .order("data");

  if (error) {
    return devFrequenciaProfessorFaltas.filter(
      (item) =>
        item.escolaId === escolaId && item.data >= inicio && item.data <= fim,
    );
  }

  return data?.map(mapFalta) ?? [];
}

export async function lancarFaltaProfessor(
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  const professorId = String(formData.get("professor_id") ?? "").trim() || null;
  const professorNome = String(formData.get("professor_nome") ?? "").trim();
  const data = String(formData.get("data") ?? "").trim();
  const observacao = String(formData.get("observacao") ?? "").trim() || null;

  if (!data) return { error: "Informe a data." };
  if (!professorId && !professorNome) {
    return { error: "Selecione ou informe o professor." };
  }

  let nomeFinal = professorNome;
  if (professorId) {
    const supabase = await createClient();
    const { data: professor } = await supabase
      .from("profiles")
      .select("nome")
      .eq("id", professorId)
      .maybeSingle();
    nomeFinal = professor?.nome ?? professorNome;
  }

  if (!nomeFinal) return { error: "Professor não encontrado." };

  const registro: FrequenciaProfessorFalta = {
    id: crypto.randomUUID(),
    escolaId: ctx.escolaId,
    professorId,
    professorNome: nomeFinal,
    data,
    observacao,
    createdAt: new Date().toISOString(),
  };

  if (await isDevSessionActive()) {
    devFrequenciaProfessorFaltas.unshift(registro);
    revalidarFrequenciaProfessor();
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("frequencia_professor_faltas").insert({
    escola_id: ctx.escolaId,
    professor_id: professorId,
    professor_nome: nomeFinal,
    data,
    observacao,
    created_by: ctx.profile.id,
  });

  if (error) {
    devFrequenciaProfessorFaltas.unshift(registro);
    revalidarFrequenciaProfessor();
    return { success: true };
  }

  revalidarFrequenciaProfessor();
  return { success: true };
}

export async function excluirFaltaProfessor(
  faltaId: string,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  if (await isDevSessionActive()) {
    const index = devFrequenciaProfessorFaltas.findIndex(
      (item) => item.id === faltaId && item.escolaId === ctx.escolaId,
    );
    if (index >= 0) devFrequenciaProfessorFaltas.splice(index, 1);
    revalidarFrequenciaProfessor();
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("frequencia_professor_faltas")
    .delete()
    .eq("id", faltaId)
    .eq("escola_id", ctx.escolaId);

  if (error) return { error: "Não foi possível excluir o registro." };

  revalidarFrequenciaProfessor();
  return { success: true };
}
