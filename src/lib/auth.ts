import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import {
  DEV_SESSION_COOKIE,
  getDevUser,
  isDevLoginEnabled,
  parseDevProfile,
} from "@/lib/dev-auth";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";

export function getDashboardPath(role: UserRole) {
  switch (role) {
    case "admin_sme":
      return "/admin";
    case "gestor_escolar":
      return "/gestor";
    case "coordenador":
      return "/coordenador";
    case "professor":
      return "/professor";
    case "tecnico_sga":
      return "/sga";
  }
}

export function getRoleLabel(role: UserRole) {
  switch (role) {
    case "admin_sme":
      return "Administrador SME";
    case "gestor_escolar":
      return "Gestor Escolar";
    case "coordenador":
      return "Coordenador Pedagógico";
    case "professor":
      return "Professor";
    case "tecnico_sga":
      return "Técnico SGA";
  }
}

async function getDevSessionProfile() {
  if (!isDevLoginEnabled()) {
    return { user: null, profile: null };
  }

  const cookieStore = await cookies();
  const profile = parseDevProfile(cookieStore.get(DEV_SESSION_COOKIE)?.value);

  if (!profile?.ativo) {
    return { user: null, profile: null };
  }

  return { user: getDevUser(profile), profile };
}

export async function getSessionProfile() {
  const devSession = await getDevSessionProfile();
  if (devSession.profile) {
    return devSession;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile };
}

export async function isDevSessionActive() {
  if (!isDevLoginEnabled()) {
    return false;
  }

  const cookieStore = await cookies();
  return Boolean(parseDevProfile(cookieStore.get(DEV_SESSION_COOKIE)?.value));
}

export async function isSgaManagementAvailable() {
  if (await isDevSessionActive()) {
    const { hasAdminClient } = await import("@/lib/supabase/admin");
    return hasAdminClient();
  }

  return true;
}

export async function requireProfile() {
  const { user, profile } = await getSessionProfile();

  if (!user || !profile?.ativo) {
    redirect("/login");
  }

  return { user, profile };
}

export async function requireRole(allowed: UserRole[]) {
  const { user, profile } = await requireProfile();

  if (!allowed.includes(profile.role)) {
    redirect(getDashboardPath(profile.role));
  }

  return { user, profile };
}
