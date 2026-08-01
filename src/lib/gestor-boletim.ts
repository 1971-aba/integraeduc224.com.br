import { getBoletimTurma, getTurmasBoletimEscola } from "@/lib/boletim";
import { createClient } from "@/lib/supabase/server";
import {
  classificarSerieBoletim,
  type NivelEnsinoBoletim,
} from "@/lib/professor-boletim";

export type BoletimAlunoModo = "completo" | "resumido";
export async function loadFichaAvaliacoesEscola(
  escolaId: string,
  nivel: NivelEnsinoBoletim,
  params: { turma?: string; bimestre?: string },
) {
  const turmas = (await getTurmasBoletimEscola(escolaId)).filter(
    (turma) => classificarSerieBoletim(turma.serie) === nivel,
  );
  const turmaId = params.turma ?? turmas[0]?.id;
  const boletim = turmaId
    ? await getBoletimTurma(escolaId, turmaId, params.bimestre)
    : null;

  return { turmas, turmaId, boletim };
}

export async function loadBoletimAlunoEscola(
  escolaId: string,
  params: { turma?: string; aluno?: string; bimestre?: string },
) {
  const turmas = await getTurmasBoletimEscola(escolaId);
  const turmaId = params.turma ?? turmas[0]?.id;
  const boletim = turmaId
    ? await getBoletimTurma(escolaId, turmaId, params.bimestre)
    : null;
  const matriculaId =
    params.aluno ?? boletim?.alunos[0]?.matriculaId ?? undefined;

  return { turmas, turmaId, boletim, matriculaId };
}

export async function getEscolaNome(escolaId: string) {
  const supabase = await createClient();
  const { data: escola } = await supabase
    .from("escolas")
    .select("nome")
    .eq("id", escolaId)
    .maybeSingle();

  return escola?.nome ?? "Unidade Escolar";
}