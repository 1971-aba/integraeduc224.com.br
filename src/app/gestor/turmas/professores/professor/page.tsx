import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { VinculosProfessorView } from "@/components/gestor/vinculos-professor-view";
import { requireRole } from "@/lib/auth";
import {
  agruparVinculosPorProfessor,
  getVinculosDocentes,
} from "@/lib/gestor-turmas";

export default async function GestorVincularProfessoresPorProfessorPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const professores = agruparVinculosPorProfessor(
    await getVinculosDocentes(profile),
  );

  return (
    <>
      <GestorPageHeader
        title="Vincular Professores — Por Professor"
        description="Carga de turmas e disciplinas atribuídas a cada professor"
      />

      <VinculosProfessorView
        professores={professores}
        emptyTitle="Nenhum professor vinculado"
        emptyDescription="Vincule professores às turmas em Turmas → Vincular Disciplinas."
      />
    </>
  );
}
