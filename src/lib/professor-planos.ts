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

export type SecaoPlano =
  | "metodologia"
  | "recursos"
  | "avaliacao"
  | "experiencias";

type SecaoPlanoConfig = {
  slug: string;
  titulo: string;
  descricao: string;
  /** Palavras-chave do título da seção no texto do plano, sem acentos. */
  marcadores: string[];
};

export const SECOES_PLANO: Record<SecaoPlano, SecaoPlanoConfig> = {
  metodologia: {
    slug: "metodologias",
    titulo: "Metodologias",
    descricao:
      "Estratégias e etapas de aula registradas nos seus planos de aula.",
    marcadores: ["METODOLOGIA"],
  },
  recursos: {
    slug: "recursos",
    titulo: "Recursos",
    descricao: "Recursos didáticos previstos nos seus planos de aula.",
    marcadores: ["RECURSOS"],
  },
  avaliacao: {
    slug: "avaliacoes",
    titulo: "Avaliações",
    descricao:
      "Instrumentos e critérios de avaliação previstos nos seus planos de aula.",
    marcadores: ["AVALIACAO", "AVALIACOES"],
  },
  experiencias: {
    slug: "experiencias",
    titulo: "Experiências",
    descricao:
      "Campos de experiências da BNCC contemplados nos seus planos de aula.",
    marcadores: ["CAMPOS DE EXPERIENCIA", "EXPERIENCIA"],
  },
};

/** Seções disponíveis em cada nível: campos de experiências só existem na educação infantil. */
export function secoesDoNivel(nivel: NivelEnsinoPlano): SecaoPlano[] {
  const base: SecaoPlano[] = ["metodologia", "recursos", "avaliacao"];
  return nivel === "infantil" ? [...base, "experiencias"] : base;
}

function semAcentos(texto: string) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

const CABECALHO_SECAO = /^\s*\d+\s*[.)-]\s*(.+?)\s*$/;

/**
 * Recorta a seção pedida de um plano estruturado com títulos numerados
 * ("5. METODOLOGIA", "6. RECURSOS DIDÁTICOS", ...).
 */
export function extrairSecaoPlano(
  conteudo: string,
  secao: SecaoPlano,
): string | null {
  const marcadores = SECOES_PLANO[secao].marcadores;
  const linhas = conteudo.split(/\r?\n/);

  let inicio = -1;

  for (let i = 0; i < linhas.length; i++) {
    const cabecalho = linhas[i].match(CABECALHO_SECAO)?.[1];
    if (!cabecalho) continue;

    const normalizado = semAcentos(cabecalho).toUpperCase();
    if (marcadores.some((marcador) => normalizado.includes(marcador))) {
      inicio = i + 1;
      break;
    }
  }

  if (inicio === -1) return null;

  const corpo: string[] = [];

  for (let i = inicio; i < linhas.length; i++) {
    if (CABECALHO_SECAO.test(linhas[i])) break;
    corpo.push(linhas[i]);
  }

  const texto = corpo.join("\n").trim();
  return texto.length > 0 ? texto : null;
}

export type PlanoSecaoResumo = PlanoAulaResumo & {
  secao: string | null;
};

export async function getPlanosSecaoProfessor(
  professorId: string,
  nivel: NivelEnsinoPlano,
  secao: SecaoPlano,
): Promise<PlanoSecaoResumo[]> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data } = await supabase
    .from("planos_aula")
    .select(
      "id, tema, serie, disciplina, updated_at, conteudo_ia, conteudo_final",
    )
    .eq("professor_id", professorId)
    .order("updated_at", { ascending: false });

  return (data ?? [])
    .filter((plano) => planoPertenceAoNivel(plano.serie, nivel))
    .map(({ conteudo_ia, conteudo_final, ...plano }) => ({
      ...plano,
      secao: extrairSecaoPlano(conteudo_final ?? conteudo_ia, secao),
    }));
}
