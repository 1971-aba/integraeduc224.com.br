import type { SupabaseClient } from "@supabase/supabase-js";

import { devAccounts } from "@/lib/dev-auth";
import { isDevSessionActive } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasAdminClient, createAdminClient } from "@/lib/supabase/admin";
import { getRoleLabelSga, roleOptions } from "@/lib/sga-dashboard";
import type { Database, UserRole } from "@/types/database";

export type SgaUsuarioRelatorio = {
  id: string;
  nome: string;
  email: string;
  cpf: string | null;
  role: UserRole;
  escola_id: string | null;
  ativo: boolean;
  created_at: string;
};

export type AcessoPorPerfil = {
  role: UserRole;
  label: string;
  total: number;
  ativos: number;
  inativos: number;
};

async function fetchAllUsuarios(): Promise<SgaUsuarioRelatorio[]> {
  if (hasAdminClient()) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("id, nome, email, cpf, role, escola_id, ativo, created_at")
      .order("nome");

    if (error) throw error;
    return (data ?? []) as SgaUsuarioRelatorio[];
  }

  if (await isDevSessionActive()) {
    const unique = new Map<string, SgaUsuarioRelatorio>();
    for (const account of devAccounts) {
      unique.set(account.profile.id, {
        id: account.profile.id,
        nome: account.profile.nome,
        email: account.profile.email,
        cpf: account.profile.cpf,
        role: account.profile.role,
        escola_id: account.profile.escola_id,
        ativo: account.profile.ativo,
        created_at: account.profile.created_at,
      });
    }
    return Array.from(unique.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR"),
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nome, email, cpf, role, escola_id, ativo, created_at")
    .order("nome");

  if (error) throw error;
  return (data ?? []) as SgaUsuarioRelatorio[];
}

export async function getSgaAcessosPorPerfil(): Promise<AcessoPorPerfil[]> {
  const usuarios = await fetchAllUsuarios();
  const contagem = new Map<UserRole, { total: number; ativos: number }>();

  for (const usuario of usuarios) {
    const atual = contagem.get(usuario.role) ?? { total: 0, ativos: 0 };
    atual.total += 1;
    if (usuario.ativo) atual.ativos += 1;
    contagem.set(usuario.role, atual);
  }

  return roleOptions.map((option) => {
    const stats = contagem.get(option.value) ?? { total: 0, ativos: 0 };
    return {
      role: option.value,
      label: option.label,
      total: stats.total,
      ativos: stats.ativos,
      inativos: stats.total - stats.ativos,
    };
  });
}

export async function getSgaLogCadastros(limite = 100): Promise<SgaUsuarioRelatorio[]> {
  const usuarios = await fetchAllUsuarios();

  return [...usuarios]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, limite);
}

export async function getSgaUsuariosParaExportacao(filters?: {
  perfil?: UserRole;
  status?: "ativo" | "inativo";
}): Promise<SgaUsuarioRelatorio[]> {
  let usuarios = await fetchAllUsuarios();

  if (filters?.perfil) {
    usuarios = usuarios.filter((item) => item.role === filters.perfil);
  }

  if (filters?.status === "ativo") {
    usuarios = usuarios.filter((item) => item.ativo);
  }

  if (filters?.status === "inativo") {
    usuarios = usuarios.filter((item) => !item.ativo);
  }

  return usuarios;
}

export async function getEscolaNomesMap(
  supabase: SupabaseClient<Database>,
): Promise<Record<string, string>> {
  const { data: escolas } = await supabase
    .from("escolas")
    .select("id, nome")
    .order("nome");

  return Object.fromEntries(
    (escolas ?? []).map((escola) => [escola.id, escola.nome]),
  );
}

export function formatUsuarioParaCsv(
  usuario: SgaUsuarioRelatorio,
  escolaNomes: Record<string, string>,
) {
  return {
    nome: usuario.nome,
    email: usuario.email,
    cpf: usuario.cpf ?? "",
    perfil: getRoleLabelSga(usuario.role),
    escola: usuario.escola_id
      ? (escolaNomes[usuario.escola_id] ?? usuario.escola_id)
      : "—",
    status: usuario.ativo ? "Ativo" : "Inativo",
    cadastro: new Date(usuario.created_at).toLocaleString("pt-BR"),
  };
}
