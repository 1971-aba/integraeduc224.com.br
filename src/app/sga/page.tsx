import { NotificationBoard } from "@/components/dashboard/notification-board";
import { SgaHomePanel } from "@/components/dashboard/sga-home-panel";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { listSgaUsuarios } from "@/actions/sga-usuarios";
import { requireRole } from "@/lib/auth";
import {
  getSgaDashboardConfig,
  getSgaNotifications,
  roleOptions,
  SGA_PANEL_TITLE,
} from "@/lib/sga-dashboard";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export default async function SgaDashboardPage() {
  const { profile } = await requireRole(["tecnico_sga", "admin_sme"]);
  const supabase = await createClient();

  const [config, notifications, usuarios] = await Promise.all([
    getSgaDashboardConfig(supabase, profile),
    getSgaNotifications(supabase),
    listSgaUsuarios(),
  ]);

  const usuariosAtivos = usuarios.filter((item) => item.ativo).length;

  const perfilCounts = roleOptions
    .map((option) => ({
      role: option.value,
      count: usuarios.filter((item) => item.role === option.value).length,
    }))
    .filter((item) => item.count > 0);

  const recentUsers = [...usuarios]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5)
    .map((usuario) => ({
      id: usuario.id,
      nome: usuario.nome,
      role: usuario.role as UserRole,
      ativo: usuario.ativo,
      createdAt: usuario.created_at,
    }));

  return (
    <>
      <GestorPageHeader
        title={SGA_PANEL_TITLE}
        description="Painel técnico da Secretaria de Educação para cadastro de logins e senhas"
      />

      <NotificationBoard
        location={config.location}
        date={config.date}
        notifications={notifications}
      />

      <SgaHomePanel
        totalUsuarios={usuarios.length}
        usuariosAtivos={usuariosAtivos}
        usuariosInativos={usuarios.length - usuariosAtivos}
        recentUsers={recentUsers}
        perfilCounts={perfilCounts}
      />
    </>
  );
}
