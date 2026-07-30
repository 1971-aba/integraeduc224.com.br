import { GestorShell } from "@/components/dashboard/gestor-shell";
import { requireRole } from "@/lib/auth";
import {
  coordenadorMenuItems,
  getCoordenadorDashboardConfig,
} from "@/lib/coordenador-dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function CoordenadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireRole(["coordenador", "admin_sme"]);
  const supabase = await createClient();
  const config = await getCoordenadorDashboardConfig(supabase, profile);

  return (
    <GestorShell
      config={config}
      menuItems={coordenadorMenuItems}
      userName={profile.nome}
    >
      {children}
    </GestorShell>
  );
}
