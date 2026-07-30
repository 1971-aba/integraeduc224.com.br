import { createClient } from "@/lib/supabase/server";
import type { NivelEnsinoPlano } from "@/lib/professor-planos";

export type PlanoCursoResumo = {
  id: string;
  titulo: string;
  disciplina: string;
  serie: string;
  nivel: NivelEnsinoPlano;
  updated_at: string;
};

export async function getPlanosCursoProfessor(
  professorId: string,
  nivel: NivelEnsinoPlano,
): Promise<PlanoCursoResumo[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("planos_curso")
    .select("id, titulo, disciplina, serie, nivel, updated_at")
    .eq("professor_id", professorId)
    .eq("nivel", nivel)
    .order("updated_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return data ?? [];
}

export async function getPlanoCursoById(
  planoId: string,
  professorId: string,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("planos_curso")
    .select("*")
    .eq("id", planoId)
    .eq("professor_id", professorId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
