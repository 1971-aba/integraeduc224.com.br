"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isDevSessionActive, requireRole } from "@/lib/auth";
import { devAccounts } from "@/lib/dev-auth";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

const ROLES_GESTOR: UserRole[] = ["coordenador", "professor"];

export type ServidorInput = {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  role: UserRole;
  ativo: boolean;
};

function normalizeCpf(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

function getEscolaIdGestor(profile: {
  role: UserRole;
  escola_id: string | null;
}) {
  if (profile.role === "gestor_escolar") {
    return profile.escola_id;
  }
  return null;
}

function validateServidorInput(input: ServidorInput, escolaId: string | null) {
  if (!escolaId) return "Escola não vinculada ao gestor.";
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
  if (!ROLES_GESTOR.includes(input.role)) {
    return "Perfil não permitido para cadastro escolar.";
  }
  return null;
}

export async function listServidoresEscola(
  escolaId: string,
  filters?: { q?: string; perfil?: UserRole; status?: "ativo" | "inativo" },
) {
  await requireRole(["gestor_escolar", "admin_sme"]);

  if (await isDevSessionActive()) {
    let list = devAccounts
      .map((account) => account.profile)
      .filter(
        (profile) =>
          profile.escola_id === escolaId &&
          ROLES_GESTOR.includes(profile.role),
      )
      .map((profile) => ({
        id: profile.id,
        nome: profile.nome,
        email: profile.email,
        cpf: profile.cpf,
        role: profile.role,
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
    .select("id, nome, email, cpf, role, ativo, created_at")
    .eq("escola_id", escolaId)
    .in("role", ROLES_GESTOR)
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

export async function createServidorEscola(input: ServidorInput) {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getEscolaIdGestor(profile);

  const error = validateServidorInput(input, escolaId);
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
        p_escola_id: escolaId,
        p_ativo: input.ativo,
      });

      if (rpcError) return { error: rpcError.message };
    } else if (hasAdminClient()) {
      const admin = createAdminClient();

      const { data: cpfExistente } = await admin
        .from("profiles")
        .select("id")
        .eq("cpf", cpf)
        .maybeSingle();

      if (cpfExistente) {
        return { error: "CPF já cadastrado na rede." };
      }

      const { data: authData, error: authError } =
        await admin.auth.admin.createUser({
          email,
          password: input.senha,
          email_confirm: true,
          user_metadata: {
            nome: input.nome.trim(),
            role: input.role,
          },
        });

      if (authError || !authData.user) {
        return {
          error: authError?.message ?? "Não foi possível criar o usuário.",
        };
      }

      const { error: profileError } = await admin.from("profiles").upsert(
        {
          id: authData.user.id,
          secretaria_id: profile.secretaria_id,
          escola_id: escolaId,
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
      error:
        caught instanceof Error ? caught.message : "Erro ao cadastrar servidor.",
    };
  }

  revalidatePath("/gestor/servidores");
  redirect("/gestor/servidores");
}

export async function toggleServidorAtivo(userId: string, ativo: boolean) {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getEscolaIdGestor(profile);

  if (!escolaId) return { error: "Escola não vinculada." };

  try {
    if (!(await isDevSessionActive())) {
      const supabase = await createClient();
      const { data: servidor } = await supabase
        .from("profiles")
        .select("escola_id, role")
        .eq("id", userId)
        .maybeSingle();

      if (
        !servidor ||
        servidor.escola_id !== escolaId ||
        !ROLES_GESTOR.includes(servidor.role)
      ) {
        return { error: "Servidor não encontrado nesta escola." };
      }

      const { error } = await supabase.rpc("sga_toggle_usuario_ativo", {
        p_user_id: userId,
        p_ativo: ativo,
      });

      if (error) return { error: error.message };
    } else if (hasAdminClient()) {
      const admin = createAdminClient();
      const { data: servidor } = await admin
        .from("profiles")
        .select("escola_id, role")
        .eq("id", userId)
        .maybeSingle();

      if (
        !servidor ||
        servidor.escola_id !== escolaId ||
        !ROLES_GESTOR.includes(servidor.role)
      ) {
        return { error: "Servidor não encontrado nesta escola." };
      }

      const { error } = await admin
        .from("profiles")
        .update({ ativo, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) return { error: error.message };
    } else {
      return { error: "Serviço indisponível no modo demo." };
    }
  } catch (caught) {
    return {
      error:
        caught instanceof Error
          ? caught.message
          : "Erro ao alterar status do servidor.",
    };
  }

  revalidatePath("/gestor/servidores");
  return { success: true };
}
