import { CoordenadorQuickLinks } from "@/components/coordenador/coordenador-quick-links";
import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { NotificationBoard } from "@/components/dashboard/notification-board";
import { requireRole } from "@/lib/auth";
import { getEscolaResumo } from "@/lib/coordenador-data";
import {
  getCoordenadorDashboardConfig,
  getCoordenadorNotifications,
} from "@/lib/coordenador-dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function CoordenadorDashboardPage() {
  const { profile } = await requireRole(["coordenador", "admin_sme"]);
  const supabase = await createClient();

  const [config, notifications, resumo] = await Promise.all([
    getCoordenadorDashboardConfig(supabase, profile),
    getCoordenadorNotifications(supabase, profile.escola_id),
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

      {!profile.escola_id ? <SemEscolaAlert /> : null}

      <CoordenadorQuickLinks resumo={resumo} />
    </>
  );
}
