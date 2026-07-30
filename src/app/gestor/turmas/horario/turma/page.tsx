import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { HorarioEscolarGrade } from "@/components/gestor/horario-escolar-grade";
import type { GrupoHorario } from "@/components/gestor/horario-escolar-grade";
import { requireRole } from "@/lib/auth";
import { getVinculosDocentes, montarHorarioEscolar } from "@/lib/gestor-turmas";

export default async function GestorHorarioPorTurmaPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const slots = montarHorarioEscolar(await getVinculosDocentes(profile));

  const grupos = new Map<string, GrupoHorario>();

  for (const slot of slots) {
    const grupo = grupos.get(slot.turmaId) ?? {
      id: slot.turmaId,
      titulo: `${slot.turmaNome} — ${slot.serie}`,
      subtitulo: slot.turno,
      slots: [],
    };

    grupo.slots.push(slot);
    grupos.set(slot.turmaId, grupo);
  }

  return (
    <>
      <GestorPageHeader
        title="Horário Escolar — Por Turma"
        description="Grade semanal de cada turma, derivada das atribuições docentes"
      />

      <HorarioEscolarGrade
        grupos={[...grupos.values()]}
        detalhe="professor"
        emptyTitle="Nenhum horário para exibir"
        emptyDescription="Vincule professores e disciplinas às turmas para gerar a grade semanal."
      />
    </>
  );
}
