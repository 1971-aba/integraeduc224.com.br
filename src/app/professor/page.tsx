import { NotificationBoard } from "@/components/dashboard/notification-board";
import { ProfessorHomePanel } from "@/components/dashboard/professor-home-panel";
import { listTarefasProfessor } from "@/actions/professor-tarefas";
import { requireRole } from "@/lib/auth";
import {
  getProfessorDashboardConfig,
  getProfessorNotifications,
  mapProfessorTurmas,
} from "@/lib/professor-dashboard";
import { countPendenciasDiario } from "@/lib/professor-diario";
import { getProfessorAtribuicoes } from "@/lib/diario";
import { createClient } from "@/lib/supabase/server";

export default async function ProfessorDashboardPage() {
  const { profile } = await requireRole(["professor"]);
  const supabase = await createClient();
  const hoje = new Date().toISOString().slice(0, 10);

  const [config, notifications, atribuicoes, { count: planosTotal }, pendenciasDiario, tarefas] =
    await Promise.all([
      getProfessorDashboardConfig(supabase, profile),
      getProfessorNotifications(supabase, profile.id),
      getProfessorAtribuicoes(profile.id),
      supabase
        .from("planos_aula")
        .select("*", { count: "exact", head: true })
        .eq("professor_id", profile.id),
      countPendenciasDiario(profile.id),
      listTarefasProfessor(profile.id),
    ]);

  const tarefasAbertas = tarefas.filter(
    (tarefa) => tarefa.dataEntrega >= hoje,
  ).length;

  return (
    <>
      <NotificationBoard
        location={config.location}
        date={config.date}
        notifications={notifications}
      />

      <ProfessorHomePanel
        turmas={mapProfessorTurmas(atribuicoes)}
        planosTotal={planosTotal ?? 0}
        pendenciasDiario={pendenciasDiario}
        tarefasAbertas={tarefasAbertas}
      />
    </>
  );
}
