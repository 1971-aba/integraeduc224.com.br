import { GestorShell } from "@/components/dashboard/gestor-shell";
import { requireRole } from "@/lib/auth";
import {
  getGestorDashboardConfig,
  getGestorMenuItems,
} from "@/lib/gestor-dashboard";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";
import { createClient } from "@/lib/supabase/server";

export default async function GestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();
  const escolaId = getGestorEscolaId(profile);
  const [config, menuItems] = await Promise.all([
    getGestorDashboardConfig(supabase, profile),
    getGestorMenuItems(supabase, escolaId),
  ]);

  return (
    <GestorShell
      config={config}
      menuItems={menuItems}
      userName={profile.nome}
    >
      {children}
    </GestorShell>
  );
}
