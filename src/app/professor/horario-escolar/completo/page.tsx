import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { HorarioCompletoActions } from "@/components/professor/horario-completo-actions";
import { HorarioCompletoView } from "@/components/professor/horario-completo-view";
import { requireRole } from "@/lib/auth";
import { getHorarioProfessor } from "@/lib/professor-horario";
import { createClient } from "@/lib/supabase/server";

export default async function HorarioCompletoPage() {
  const { profile } = await requireRole(["professor"]);
  const slots = await getHorarioProfessor(profile.id);

  const supabase = await createClient();
  const { data: escola } = profile.escola_id
    ? await supabase
        .from("escolas")
        .select("nome")
        .eq("id", profile.escola_id)
        .maybeSingle()
    : { data: null };

  return (
    <>
      <GestorPageHeader
        title="Horário Completo"
        description="Grade semanal integral com todos os períodos e intervalos"
        actions={<HorarioCompletoActions />}
      />
      <HorarioCompletoView
        slots={slots}
        professorNome={profile.nome ?? "Professor"}
        escolaNome={escola?.nome}
      />
    </>
  );
}
