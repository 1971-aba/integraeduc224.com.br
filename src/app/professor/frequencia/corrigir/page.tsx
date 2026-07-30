import { ProfessorTurmasGrid } from "@/components/professor/professor-turmas-grid";
import { requireRole } from "@/lib/auth";
import { mapProfessorTurmas } from "@/lib/professor-dashboard";
import { getProfessorAtribuicoes } from "@/lib/diario";

export default async function CorrigirFrequenciaPage() {
  const { profile } = await requireRole(["professor"]);
  const atribuicoes = await getProfessorAtribuicoes(profile.id);
  const turmas = mapProfessorTurmas(atribuicoes);

  return (
    <ProfessorTurmasGrid
      title="Corrigir Frequência"
      description="Selecione a turma para revisar e corrigir chamadas já registradas"
      turmas={turmas}
      hrefForTurma={(id) => `/professor/frequencia/corrigir/${id}`}
      actionLabel="Ver chamadas"
    />
  );
}
