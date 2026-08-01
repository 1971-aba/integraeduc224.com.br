import { getBoletimTurma, getTurmasBoletimEscola } from "@/lib/boletim";
import {
  classificarSerieBoletim,
  type NivelEnsinoBoletim,
} from "@/lib/professor-boletim";

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
