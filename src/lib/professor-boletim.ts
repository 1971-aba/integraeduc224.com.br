import { createClient } from "@/lib/supabase/server";
import { getBoletimTurma } from "@/lib/boletim";
import { getProfessorAtribuicoes } from "@/lib/diario";
import type { BoletimTurmaOption } from "@/lib/boletim";

export type NivelEnsinoBoletim = "fundamental" | "infantil";

export function classificarSerieBoletim(serie: string): NivelEnsinoBoletim | null {
  const s = serie.toLowerCase();
  if (
    s.includes("infantil") ||
    s.includes("berçário") ||
    s.includes("bercario") ||
    s.includes("maternal") ||
    s.includes("pré") ||
    s.includes("pre ")
  ) {
    return "infantil";
  }
  if (s.includes("fundamental") || /\d+[º°]?\s*ano/.test(s)) {
    return "fundamental";
  }
  return null;
}

export async function getTurmasBoletimProfessor(
  professorId: string,
  nivel?: NivelEnsinoBoletim,
): Promise<BoletimTurmaOption[]> {
  const atribuicoes = await getProfessorAtribuicoes(professorId);
  const turmasMap = new Map<string, BoletimTurmaOption>();

  for (const item of atribuicoes) {
    if (!item.turmas?.id) continue;
    const serie = item.turmas.serie;
    if (nivel && classificarSerieBoletim(serie) !== nivel) continue;

    turmasMap.set(item.turmas.id, {
      id: item.turmas.id,
      label: `${item.turmas.nome} — ${serie} (${item.turmas.turno})`,
      serie,
    });
  }

  return [...turmasMap.values()].sort((a, b) =>
    a.label.localeCompare(b.label, "pt-BR"),
  );
}
export async function professorTemAcessoTurma(
  professorId: string,
  turmaId: string,
): Promise<boolean> {
  const turmas = await getTurmasBoletimProfessor(professorId);
  return turmas.some((turma) => turma.id === turmaId);
}

export async function getEscolaIdProfessor(
  professorId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("escola_id")
    .eq("id", professorId)
    .maybeSingle();

  return data?.escola_id ?? null;
}

export async function loadFichaNotasProfessor(
  professorId: string,
  nivel: NivelEnsinoBoletim,
  params: { turma?: string; bimestre?: string },
) {
  const escolaId = await getEscolaIdProfessor(professorId);
  if (!escolaId) {
    return { escolaId: null, turmas: [], turmaId: undefined, boletim: null };
  }

  const turmas = await getTurmasBoletimProfessor(professorId, nivel);
  const turmaId = params.turma ?? turmas[0]?.id;
  const temAcesso = turmaId
    ? await professorTemAcessoTurma(professorId, turmaId)
    : false;
  const boletim =
    turmaId && temAcesso
      ? await getBoletimTurma(escolaId, turmaId, params.bimestre)
      : null;

  return { escolaId, turmas, turmaId, boletim };
}
