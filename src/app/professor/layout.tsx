import { GestorShell } from "@/components/dashboard/gestor-shell";
import { requireRole } from "@/lib/auth";
import {
  getProfessorDashboardConfig,
  professorMenuItems,
} from "@/lib/professor-dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireRole(["professor"]);
  const supabase = await createClient();
  const config = await getProfessorDashboardConfig(supabase, profile);

  return (
    <GestorShell
      config={config}
      menuItems={professorMenuItems}
      userName={profile.nome}
    >
      {children}
    </GestorShell>
  );
}
