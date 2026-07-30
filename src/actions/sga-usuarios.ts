"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isDevSessionActive, requireRole } from "@/lib/auth";
import { devAccounts, isDevLoginEnabled } from "@/lib/dev-auth";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export type SgaUsuarioInput = {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  role: UserRole;
  escolaId: string | null;
  ativo: boolean;
};

function normalizeCpf(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

function validateUsuarioInput(input: SgaUsuarioInput) {
  if (!input.nome.trim()) return "Informe o nome completo.";
  if (!input.email.trim() || !input.email.includes("@")) {
    return "Informe um e-mail institucional válido.";
  }
  if (normalizeCpf(input.cpf).length !== 11) {
    return "Informe um CPF válido com 11 dígitos.";
  }
  if (input.senha.length < 8) {
    return "A senha deve ter no mínimo 8 caracteres.";
  }
  if (
    ["gestor_escolar", "coordenador", "professor"].includes(input.role) &&
    !input.escolaId
  ) {
    return "Selecione a escola para este perfil.";
  }
  return null;
}

export async function createSgaUsuario(input: SgaUsuarioInput) {
  const { profile } = await requireRole(["tecnico_sga", "admin_sme"]);

  const error = validateUsuarioInput(input);
  if (error) return { error };

  const cpf = normalizeCpf(input.cpf);
  const email = input.email.trim().toLowerCase();

  try {
    if (!(await isDevSessionActive())) {
      const supabase = await createClient();
      const { error: rpcError } = await supabase.rpc("sga_criar_usuario", {
        p_nome: input.nome.trim(),
        p_email: email,
        p_cpf: cpf,
        p_senha: input.senha,
        p_role: input.role,
        p_escola_id: input.escolaId,
        p_ativo: input.ativo,
      });

      if (rpcError) return { error: rpcError.message };
    } else if (hasAdminClient()) {
      const admin = createAdminClient();
      const secretariaId = profile.secretaria_id ?? null;

      const { data: cpfExistente } = await admin
        .from("profiles")
        .select("id")
        .eq("cpf", cpf)
        .maybeSingle();

      if (cpfExistente) {
        return { error: "CPF já cadastrado na rede." };
      }

      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email,
        password: input.senha,
        email_confirm: true,
        user_metadata: {
          nome: input.nome.trim(),
          role: input.role,
        },
      });

      if (authError || !authData.user) {
        return { error: authError?.message ?? "Não foi possível criar o usuário." };
      }

      const { error: profileError } = await admin.from("profiles").upsert(
        {
          id: authData.user.id,
          secretaria_id: secretariaId,
          escola_id: input.escolaId,
          role: input.role,
          nome: input.nome.trim(),
          cpf,
          email,
          ativo: input.ativo,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (profileError) {
        await admin.auth.admin.deleteUser(authData.user.id);
        return { error: profileError.message };
      }
    } else {
      return {
        error:
          "Cadastro indisponível no modo demo. Entre com login real do Supabase.",
      };
    }
  } catch (caught) {
    return {
      error: caught instanceof Error ? caught.message : "Erro ao cadastrar usuário.",
    };
  }

  revalidatePath("/sga");
  revalidatePath("/sga/usuarios");
  redirect("/sga/usuarios");
}

export async function updateSgaUsuario(
  userId: string,
  input: Omit<SgaUsuarioInput, "senha"> & { senha?: string },
) {
  const { profile } = await requireRole(["tecnico_sga", "admin_sme"]);

  if (!input.nome.trim()) return { error: "Informe o nome completo." };
  if (!input.email.trim() || !input.email.includes("@")) {
    return { error: "Informe um e-mail institucional válido." };
  }
  if (normalizeCpf(input.cpf).length !== 11) {
    return { error: "Informe um CPF válido com 11 dígitos." };
  }
  if (input.senha && input.senha.length < 8) {
    return { error: "A senha deve ter no mínimo 8 caracteres." };
  }
  if (
    ["gestor_escolar", "coordenador", "professor"].includes(input.role) &&
    !input.escolaId
  ) {
    return { error: "Selecione a escola para este perfil." };
  }

  const cpf = normalizeCpf(input.cpf);
  const email = input.email.trim().toLowerCase();

  try {
    if (!(await isDevSessionActive())) {
      const supabase = await createClient();
      const { error: rpcError } = await supabase.rpc("sga_atualizar_usuario", {
        p_user_id: userId,
        p_nome: input.nome.trim(),
        p_email: email,
        p_cpf: cpf,
        p_role: input.role,
        p_escola_id: input.escolaId,
        p_ativo: input.ativo,
        p_senha: input.senha ?? null,
      });

      if (rpcError) return { error: rpcError.message };
    } else if (hasAdminClient()) {
      const admin = createAdminClient();

      const authUpdate: { email?: string; password?: string } = { email };
      if (input.senha && input.senha.length >= 8) {
        authUpdate.password = input.senha;
      }

      const { error: authError } = await admin.auth.admin.updateUserById(
        userId,
        authUpdate,
      );

      if (authError) return { error: authError.message };

      const { error: profileError } = await admin
        .from("profiles")
        .update({
          nome: input.nome.trim(),
          cpf,
          email,
          role: input.role,
          escola_id: input.escolaId,
          secretaria_id: profile.secretaria_id,
          ativo: input.ativo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileError) return { error: profileError.message };
    } else {
      return {
        error:
          "Atualização indisponível no modo demo. Entre com login real do Supabase.",
      };
    }
  } catch (caught) {
    return {
      error:
        caught instanceof Error ? caught.message : "Erro ao atualizar usuário.",
    };
  }

  revalidatePath("/sga/usuarios");
  revalidatePath(`/sga/usuarios/${userId}`);
  return { success: true };
}

export async function toggleSgaUsuarioAtivo(userId: string, ativo: boolean) {
  const { profile } = await requireRole(["tecnico_sga", "admin_sme"]);

  try {
    if (!(await isDevSessionActive())) {
      const supabase = await createClient();
      const { error } = await supabase.rpc("sga_toggle_usuario_ativo", {
        p_user_id: userId,
        p_ativo: ativo,
      });

      if (error) return { error: error.message };
    } else if (hasAdminClient()) {
      const admin = createAdminClient();
      const { error } = await admin
        .from("profiles")
        .update({ ativo, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) return { error: error.message };
    } else {
      return { error: "Serviço de administração indisponível no modo demo." };
    }
  } catch (caught) {
    return {
      error:
        caught instanceof Error ? caught.message : "Erro ao alterar status do usuário.",
    };
  }

  revalidatePath("/sga/usuarios");
  return { success: true };
}

export async function listSgaUsuarios(filters?: {
  perfil?: UserRole;
  status?: "ativo" | "inativo";
  q?: string;
}) {
  await requireRole(["tecnico_sga", "admin_sme"]);

  if (hasAdminClient()) {
    const admin = createAdminClient();
    let query = admin
      .from("profiles")
      .select("id, nome, email, cpf, role, escola_id, ativo, created_at")
      .order("nome");

    if (filters?.perfil) query = query.eq("role", filters.perfil);
    if (filters?.status === "ativo") query = query.eq("ativo", true);
    if (filters?.status === "inativo") query = query.eq("ativo", false);
    if (filters?.q?.trim()) {
      query = query.or(
        `nome.ilike.%${filters.q.trim()}%,email.ilike.%${filters.q.trim()}%,cpf.ilike.%${filters.q.trim()}%`,
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  if (await isDevSessionActive()) {
    const unique = new Map<string, (typeof devAccounts)[number]["profile"]>();
    for (const account of devAccounts) {
      unique.set(account.profile.id, account.profile);
    }

    let list = Array.from(unique.values()).map((profile) => ({
      id: profile.id,
      nome: profile.nome,
      email: profile.email,
      cpf: profile.cpf,
      role: profile.role,
      escola_id: profile.escola_id,
      ativo: profile.ativo,
      created_at: profile.created_at,
    }));

    if (filters?.perfil) {
      list = list.filter((item) => item.role === filters.perfil);
    }
    if (filters?.status === "ativo") {
      list = list.filter((item) => item.ativo);
    }
    if (filters?.status === "inativo") {
      list = list.filter((item) => !item.ativo);
    }
    if (filters?.q?.trim()) {
      const q = filters.q.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.nome.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          (item.cpf ?? "").includes(q),
      );
    }

    return list.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }

  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, nome, email, cpf, role, escola_id, ativo, created_at")
    .order("nome");

  if (filters?.perfil) {
    query = query.eq("role", filters.perfil);
  }

  if (filters?.status === "ativo") {
    query = query.eq("ativo", true);
  }

  if (filters?.status === "inativo") {
    query = query.eq("ativo", false);
  }

  if (filters?.q?.trim()) {
    query = query.or(
      `nome.ilike.%${filters.q.trim()}%,email.ilike.%${filters.q.trim()}%,cpf.ilike.%${filters.q.trim()}%`,
    );
  }

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}

export async function getSgaUsuarioById(userId: string) {
  await requireRole(["tecnico_sga", "admin_sme"]);

  if (hasAdminClient()) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  if (await isDevSessionActive()) {
    const account = devAccounts.find((item) => item.profile.id === userId);
    return account?.profile ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
