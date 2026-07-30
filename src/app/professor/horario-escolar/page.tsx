import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { HorarioEscolarView } from "@/components/professor/horario-escolar-view";
import { requireRole } from "@/lib/auth";
import { getHorarioProfessor } from "@/lib/professor-horario";

export default async function HorarioEscolarPage() {
  const { profile } = await requireRole(["professor"]);
  const slots = await getHorarioProfessor(profile.id);

  return (
    <>
      <GestorPageHeader
        title="Horário Escolar"
        description="Grade semanal das suas turmas e disciplinas vinculadas"
      />
      <HorarioEscolarView slots={slots} />
    </>
  );
}
