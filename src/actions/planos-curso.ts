"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { generatePlanoCursoDemo } from "@/lib/ai/generate-plano-curso-demo";
import {
  filtrarSeriesPorNivel,
  tituloNivelPlano,
  type NivelEnsinoPlano,
} from "@/lib/professor-planos";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean };

function parseNivel(value: string): NivelEnsinoPlano | null {
  return value === "fundamental" || value === "infantil" ? value : null;
}

export async function gerarPlanoCurso(formData: FormData): Promise<ActionResult> {
  const { profile } = await requireRole(["professor"]);

  const titulo = String(formData.get("titulo") ?? "").trim();
  const serie = String(formData.get("serie") ?? "").trim();
  const disciplina = String(formData.get("disciplina") ?? "").trim();
  const nivel = parseNivel(String(formData.get("nivel") ?? ""));
  const atribuicaoId = String(formData.get("atribuicao_id") ?? "").trim();

  if (!titulo || titulo.length < 5) {
    return { error: "Informe um título com pelo menos 5 caracteres." };
  }

  if (!serie || !disciplina || !nivel) {
    return { error: "Preencha disciplina, série e nível de ensino." };
  }

  const seriesValidas = filtrarSeriesPorNivel(nivel);
  if (!seriesValidas.includes(serie)) {
    return { error: "Série incompatível com o nível selecionado." };
  }

  const conteudoIa = generatePlanoCursoDemo({
    titulo,
    serie,
    disciplina,
    professorNome: profile.nome,
    nivelLabel: tituloNivelPlano(nivel),
  });

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("planos_curso")
    .insert({
      professor_id: profile.id,
      atribuicao_id: atribuicaoId || null,
      nivel,
      disciplina,
      serie,
      titulo,
      conteudo_ia: conteudoIa,
      conteudo_final: conteudoIa,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      error:
        error?.code === "42P01"
          ? "Tabela de planos de curso indisponível. Aplique a migration no Supabase."
          : "Não foi possível salvar o plano de curso.",
    };
  }

  revalidatePath(`/professor/planos/curso/${nivel}`);
  redirect(`/professor/planos/curso/${data.id}`);
}

export async function salvarPlanoCurso(
  planoId: string,
  conteudoFinal: string,
): Promise<ActionResult> {
  const { profile } = await requireRole(["professor"]);
  const texto = conteudoFinal.trim();

  if (texto.length < 20) {
    return { error: "O plano deve ter pelo menos 20 caracteres." };
  }

  const supabase = await createClient();
  const { data: plano } = await supabase
    .from("planos_curso")
    .select("nivel")
    .eq("id", planoId)
    .eq("professor_id", profile.id)
    .maybeSingle();

  const { error } = await supabase
    .from("planos_curso")
    .update({ conteudo_final: texto, updated_at: new Date().toISOString() })
    .eq("id", planoId)
    .eq("professor_id", profile.id);

  if (error) {
    return { error: "Não foi possível salvar as alterações." };
  }

  if (plano?.nivel) {
    revalidatePath(`/professor/planos/curso/${plano.nivel}`);
  }
  revalidatePath(`/professor/planos/curso/${planoId}`);
  return { success: true };
}

export async function excluirPlanoCurso(
  planoId: string,
  nivel: NivelEnsinoPlano,
): Promise<ActionResult> {
  const { profile } = await requireRole(["professor"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("planos_curso")
    .delete()
    .eq("id", planoId)
    .eq("professor_id", profile.id);

  if (error) {
    return { error: "Não foi possível excluir o plano de curso." };
  }

  revalidatePath(`/professor/planos/curso/${nivel}`);
  redirect(`/professor/planos/curso/${nivel}`);
}
