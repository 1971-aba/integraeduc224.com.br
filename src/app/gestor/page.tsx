import { NotificationBoard } from "@/components/dashboard/notification-board";
import { GestorHomePanel } from "@/components/dashboard/gestor-home-panel";
import { requireRole } from "@/lib/auth";
import { getEscolaResumo } from "@/lib/coordenador-data";
import {
  getGestorDashboardConfig,
  getGestorNotifications,
} from "@/lib/gestor-dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function GestorDashboardPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();

  const [config, notifications, resumo] = await Promise.all([
    getGestorDashboardConfig(supabase, profile),
    getGestorNotifications(supabase, profile.escola_id),
    profile.escola_id
      ? getEscolaResumo(supabase, profile.escola_id)
      : Promise.resolve(null),
  ]);

  return (
    <>
      <NotificationBoard
        location={config.location}
        date={config.date}
        notifications={notifications}
      />

      <GestorHomePanel resumo={resumo} />
    </>
  );
}
