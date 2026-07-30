import { classificarSerieBoletim } from "@/lib/professor-boletim";
import { SERIES_ESCOLARES } from "@/lib/ai/config";

export type NivelEnsinoPlano = "fundamental" | "infantil";

export type PlanoAulaResumo = {
  id: string;
  tema: string;
  serie: string;
  disciplina: string | null;
  updated_at: string;
};

export function filtrarSeriesPorNivel(nivel: NivelEnsinoPlano): string[] {
  return SERIES_ESCOLARES.filter(
    (serie) => classificarSerieBoletim(serie) === nivel,
  );
}

export function planoPertenceAoNivel(
  serie: string,
  nivel: NivelEnsinoPlano,
): boolean {
  return classificarSerieBoletim(serie) === nivel;
}

export function filtrarPlanosPorNivel(
  planos: PlanoAulaResumo[],
  nivel: NivelEnsinoPlano,
): PlanoAulaResumo[] {
  return planos.filter((plano) => planoPertenceAoNivel(plano.serie, nivel));
}

export type PlanoCursoGrupo = {
  disciplina: string;
  serie: string;
  totalPlanos: number;
  ultimoTema: string | null;
  ultimaAtualizacao: string | null;
};

export function agruparPlanosCurso(
  planos: PlanoAulaResumo[],
  nivel: NivelEnsinoPlano,
): PlanoCursoGrupo[] {
  const filtrados = filtrarPlanosPorNivel(planos, nivel);
  const map = new Map<string, PlanoCursoGrupo>();

  for (const plano of filtrados) {
    const key = `${plano.disciplina ?? "Geral"}|${plano.serie}`;
    const atual = map.get(key);

    if (!atual) {
      map.set(key, {
        disciplina: plano.disciplina ?? "Geral",
        serie: plano.serie,
        totalPlanos: 1,
        ultimoTema: plano.tema,
        ultimaAtualizacao: plano.updated_at,
      });
      continue;
    }

    map.set(key, {
      ...atual,
      totalPlanos: atual.totalPlanos + 1,
      ultimoTema:
        plano.updated_at > (atual.ultimaAtualizacao ?? "")
          ? plano.tema
          : atual.ultimoTema,
      ultimaAtualizacao:
        plano.updated_at > (atual.ultimaAtualizacao ?? "")
          ? plano.updated_at
          : atual.ultimaAtualizacao,
    });
  }

  return [...map.values()].sort((a, b) => {
    const disciplina = a.disciplina.localeCompare(b.disciplina, "pt-BR");
    if (disciplina !== 0) return disciplina;
    return a.serie.localeCompare(b.serie, "pt-BR");
  });
}

export async function getPlanosProfessor(
  professorId: string,
): Promise<PlanoAulaResumo[]> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data } = await supabase
    .from("planos_aula")
    .select("id, tema, serie, disciplina, updated_at")
    .eq("professor_id", professorId)
    .order("updated_at", { ascending: false });

  return data ?? [];
}

export function tituloNivelPlano(nivel: NivelEnsinoPlano) {
  return nivel === "fundamental" ? "Ensino Fundamental" : "Educação Infantil";
}
