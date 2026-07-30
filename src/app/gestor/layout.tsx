import { GestorShell } from "@/components/dashboard/gestor-shell";
import { requireRole } from "@/lib/auth";
import {
  getGestorDashboardConfig,
  gestorMenuItems,
} from "@/lib/gestor-dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function GestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();
  const config = await getGestorDashboardConfig(supabase, profile);

  return (
    <GestorShell
      config={config}
      menuItems={gestorMenuItems}
      userName={profile.nome}
    >
      {children}
    </GestorShell>
  );
}
