import { createClient } from "@/lib/supabase/server";
import type { CalendarioEvento } from "@/lib/calendario-escolar";
import { getCalendarioEscolar } from "@/lib/calendario-escolar";

const TIPOS_FERIADO = new Set(["feriado", "recesso", "folga"]);

export function filtrarFeriadosOficiais(eventos: CalendarioEvento[]) {
  return eventos.filter((evento) => TIPOS_FERIADO.has(evento.tipo));
}

export async function getFeriadosOficiais(secretariaId: string) {
  const calendario = await getCalendarioEscolar(secretariaId);
  if (!calendario) return [];
  return filtrarFeriadosOficiais(calendario.eventos);
}

export async function getMatriculasEntradaEscola(escolaId: string) {
  const supabase = await createClient();

  const { data: turmas } = await supabase
    .from("turmas")
    .select("id, nome, serie")
    .eq("escola_id", escolaId);

  const turmaIds = turmas?.map((t) => t.id) ?? [];
  if (turmaIds.length === 0) return [];

  const { data: matriculas } = await supabase
    .from("matriculas")
    .select("id, aluno_id, turma_id")
    .in("turma_id", turmaIds)
    .eq("status", "ativa");

  const alunoIds = matriculas?.map((m) => m.aluno_id) ?? [];
  const { data: alunos } = alunoIds.length
    ? await supabase.from("alunos").select("id, nome").in("id", alunoIds)
    : { data: [] };

  const turmaMap = new Map(turmas?.map((t) => [t.id, t]) ?? []);

  return (matriculas ?? [])
    .map((matricula) => {
      const aluno = alunos?.find((a) => a.id === matricula.aluno_id);
      const turma = turmaMap.get(matricula.turma_id);
      return {
        matriculaId: matricula.id,
        alunoNome: aluno?.nome ?? "Aluno",
        turmaNome: turma?.nome ?? "—",
        turmaSerie: turma?.serie ?? "—",
      };
    })
    .sort((a, b) => a.alunoNome.localeCompare(b.alunoNome, "pt-BR"));
}
