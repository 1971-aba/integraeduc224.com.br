import type { SupabaseClient } from "@supabase/supabase-js";

import { formatDashboardDate } from "@/lib/dashboard-utils";
import { DEMO_SECRETARIA_ID } from "@/lib/dev-auth";
import type { DashboardConfig, DashboardNotification, MenuItem } from "@/types/dashboard";
import type { Database, Profile, UserRole } from "@/types/database";

const EM_BREVE_BASE = "/sga/em-breve";

function emBreve(modulo: string) {
  return `${EM_BREVE_BASE}?modulo=${encodeURIComponent(modulo)}`;
}

export const SGA_PANEL_TITLE = "SGA — Sistema de Gestão de Acessos";

export const roleOptions: { value: UserRole; label: string }[] = [
  { value: "gestor_escolar", label: "Gestor Escolar" },
  { value: "coordenador", label: "Coordenador Pedagógico" },
  { value: "professor", label: "Professor" },
  { value: "tecnico_sga", label: "Técnico SGA" },
  { value: "admin_sme", label: "Administrador SME" },
];

export const sgaMenuItems: MenuItem[] = [
  { label: "Home", href: "/sga" },
  {
    label: "Usuários",
    children: [
      { label: "Cadastrar Usuário", href: "/sga/usuarios/novo" },
      { label: "Listar Usuários", href: "/sga/usuarios" },
      { label: "Usuários Inativos", href: "/sga/usuarios?status=inativo" },
    ],
  },
  {
    label: "Perfis de Acesso",
    children: [
      { label: "Gestores Escolares", href: "/sga/usuarios?perfil=gestor_escolar" },
      { label: "Coordenadores", href: "/sga/usuarios?perfil=coordenador" },
      { label: "Professores", href: "/sga/usuarios?perfil=professor" },
      { label: "Técnicos SGA", href: "/sga/usuarios?perfil=tecnico_sga" },
      { label: "Administradores SME", href: "/sga/usuarios?perfil=admin_sme" },
    ],
  },
  {
    label: "Escolas",
    children: [
      { label: "Escolas da Rede", href: "/admin/escolas" },
      { label: "Usuários por Escola", href: "/sga/usuarios?agrupar=escola" },
    ],
  },
  {
    label: "Relatórios",
    children: [
      { label: "Visão Geral", href: "/sga/relatorios" },
      { label: "Acessos por Perfil", href: "/sga/relatorios/acessos-por-perfil" },
      { label: "Log de Cadastros", href: "/sga/relatorios/log-cadastros" },
      { label: "Exportar Usuários", href: "/sga/relatorios/exportar" },
    ],
  },
  {
    label: "Configurações",
    children: [
      { label: "Política de Senhas", href: "/sga/configuracoes" },
      { label: "Permissões do SGA", href: "/sga/configuracoes" },
    ],
  },
];

export async function getSgaDashboardConfig(
  supabase: SupabaseClient<Database>,
  profile: Profile,
): Promise<DashboardConfig> {
  const secretariaId = profile.secretaria_id ?? DEMO_SECRETARIA_ID;

  const { data: secretaria } = await supabase
    .from("secretarias")
    .select("nome, municipio, uf")
    .eq("id", secretariaId)
    .maybeSingle();

  const location = secretaria
    ? `${secretaria.municipio}-${secretaria.uf}`
    : "Jardim do Mulato-PI";

  return {
    schoolName: secretaria?.nome.toUpperCase() ?? "SECRETARIA MUNICIPAL DE EDUCAÇÃO",
    location,
    date: formatDashboardDate(new Date()),
  };
}

export async function getSgaNotifications(
  supabase: SupabaseClient<Database>,
): Promise<DashboardNotification[]> {
  const notifications: DashboardNotification[] = [
    {
      id: "alert-sga",
      type: "alert",
      message:
        "SGA: todos os logins e senhas da rede devem ser cadastrados por este painel",
    },
    {
      id: "info-admin-key",
      type: "info",
      message:
        "Gestão de acessos conectada ao Supabase (funções SGA ativas)",
    },
  ];

  const { count: totalUsuarios } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: usuariosAtivos } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("ativo", true);

  const hoje = new Date().toISOString().slice(0, 10);
  const { count: criadosHoje } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${hoje}T00:00:00`)
    .lte("created_at", `${hoje}T23:59:59`);

  notifications.push({
    id: "stats-usuarios",
    type: "stats",
    message: "Usuários cadastrados na rede:",
    highlight: String(totalUsuarios ?? 0),
    detail: `ativos: ${usuariosAtivos ?? 0}`,
  });

  if ((criadosHoje ?? 0) > 0) {
    notifications.push({
      id: "info-hoje",
      type: "info",
      message: `${criadosHoje} usuário(s) cadastrado(s) hoje pelo SGA`,
    });
  }

  const inativos = (totalUsuarios ?? 0) - (usuariosAtivos ?? 0);
  if (inativos > 0) {
    notifications.push({
      id: "birthday-inativos",
      type: "birthday",
      message: `Atenção: ${inativos} usuário(s) inativo(s) na rede`,
      detail: "REVISAR ACESSOS",
    });
  }

  return notifications;
}

export function getRoleLabelSga(role: UserRole) {
  return roleOptions.find((item) => item.value === role)?.label ?? role;
}
