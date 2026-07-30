import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { HorarioEscolarGrade } from "@/components/gestor/horario-escolar-grade";
import type { GrupoHorario } from "@/components/gestor/horario-escolar-grade";
import { requireRole } from "@/lib/auth";
import { getVinculosDocentes, montarHorarioEscolar } from "@/lib/gestor-turmas";

export default async function GestorHorarioPorProfessorPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const slots = montarHorarioEscolar(await getVinculosDocentes(profile));

  const grupos = new Map<string, GrupoHorario>();

  for (const slot of slots) {
    const grupo = grupos.get(slot.professorId) ?? {
      id: slot.professorId,
      titulo: slot.professorNome,
      slots: [],
    };

    grupo.slots.push(slot);
    grupos.set(slot.professorId, grupo);
  }

  const ordenados = [...grupos.values()].sort((a, b) =>
    a.titulo.localeCompare(b.titulo, "pt-BR"),
  );

  return (
    <>
      <GestorPageHeader
        title="Horário Escolar — Por Professor"
        description="Grade semanal de cada professor, derivada das atribuições docentes"
      />

      <HorarioEscolarGrade
        grupos={ordenados}
        detalhe="turma"
        emptyTitle="Nenhum horário para exibir"
        emptyDescription="Vincule professores e disciplinas às turmas para gerar a grade semanal."
      />
    </>
  );
}
