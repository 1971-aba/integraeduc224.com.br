import { createClient } from "@/lib/supabase/server";
import { getProfessorAtribuicoes } from "@/lib/diario";
import type { BoletimTurmaOption } from "@/lib/boletim";

export async function getTurmasBoletimProfessor(
  professorId: string,
): Promise<BoletimTurmaOption[]> {
  const atribuicoes = await getProfessorAtribuicoes(professorId);
  const turmasMap = new Map<string, BoletimTurmaOption>();

  for (const item of atribuicoes) {
    if (!item.turmas?.id) continue;
    turmasMap.set(item.turmas.id, {
      id: item.turmas.id,
      label: `${item.turmas.nome} — ${item.turmas.serie} (${item.turmas.turno})`,
      serie: item.turmas.serie,
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
