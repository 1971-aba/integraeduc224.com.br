import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { VinculosTurmaView } from "@/components/gestor/vinculos-turma-view";
import { requireRole } from "@/lib/auth";
import {
  agruparVinculosPorTurma,
  getVinculosDocentes,
} from "@/lib/gestor-turmas";

export default async function GestorVincularProfessoresPorTurmaPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const turmas = agruparVinculosPorTurma(await getVinculosDocentes(profile));

  return (
    <>
      <GestorPageHeader
        title="Vincular Professores — Por Turma"
        description="Professores responsáveis por cada disciplina, organizados por turma"
      />

      <VinculosTurmaView
        turmas={turmas}
        mostrarEscola={profile.role === "admin_sme"}
        emptyTitle="Nenhum professor vinculado"
        emptyDescription="Vincule professores às turmas em Turmas → Vincular Disciplinas."
      />
    </>
  );
}
