import { ProfessorTurmasGrid } from "@/components/professor/professor-turmas-grid";
import { requireRole } from "@/lib/auth";
import { CHAMADA_TIPOS } from "@/lib/chamada-tipos";
import { mapProfessorTurmas } from "@/lib/professor-dashboard";
import { getProfessorAtribuicoes } from "@/lib/diario";

export default async function AcompanhamentoAeePage() {
  const { profile } = await requireRole(["professor"]);
  const atribuicoes = await getProfessorAtribuicoes(profile.id);
  const turmas = mapProfessorTurmas(atribuicoes);

  return (
    <ProfessorTurmasGrid
      title={CHAMADA_TIPOS.aee.label}
      description={CHAMADA_TIPOS.aee.descricao}
      turmas={turmas}
      hrefForTurma={(id) => `/professor/frequencia/aee/${id}`}
      actionLabel="Registrar AEE"
    />
  );
}
