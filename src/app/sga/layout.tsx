import Link from "next/link";
import { UserPlus } from "lucide-react";

import { GestorShell } from "@/components/dashboard/gestor-shell";
import { requireRole } from "@/lib/auth";
import {
  getSgaDashboardConfig,
  sgaMenuItems,
} from "@/lib/sga-dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function SgaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireRole(["tecnico_sga", "admin_sme"]);
  const supabase = await createClient();
  const config = await getSgaDashboardConfig(supabase, profile);

  return (
    <GestorShell
      config={config}
      menuItems={sgaMenuItems}
      userName={profile.nome}
    >
      {children}
    </GestorShell>
  );
}
