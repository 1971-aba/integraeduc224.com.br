"use server";

import { revalidatePath } from "next/cache";

import { isDevSessionActive, requireRole } from "@/lib/auth";
import { devConfiguracaoRede } from "@/lib/dev-gestor-modulos";
import type {
  ConfiguracaoRede,
  PermissoesSga,
  PoliticaSenha,
} from "@/lib/gestor-modulos-types";
import {
  DEFAULT_PERMISSOES_SGA,
  DEFAULT_POLITICA_SENHA,
} from "@/lib/gestor-modulos-types";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean };

function parsePoliticaSenha(value: unknown): PoliticaSenha {
  if (!value || typeof value !== "object") return { ...DEFAULT_POLITICA_SENHA };
  const raw = value as Record<string, unknown>;
  return {
    minLength: Number(raw.minLength) || DEFAULT_POLITICA_SENHA.minLength,
    exigeMaiuscula: Boolean(raw.exigeMaiuscula ?? DEFAULT_POLITICA_SENHA.exigeMaiuscula),
    exigeNumero: Boolean(raw.exigeNumero ?? DEFAULT_POLITICA_SENHA.exigeNumero),
    exigeEspecial: Boolean(raw.exigeEspecial ?? DEFAULT_POLITICA_SENHA.exigeEspecial),
  };
}

function parsePermissoesSga(value: unknown): PermissoesSga {
  if (!value || typeof value !== "object") return { ...DEFAULT_PERMISSOES_SGA };
  const raw = value as Record<string, unknown>;
  return {
    podeCriarGestor: Boolean(raw.podeCriarGestor ?? DEFAULT_PERMISSOES_SGA.podeCriarGestor),
    podeCriarAdmin: Boolean(raw.podeCriarAdmin ?? DEFAULT_PERMISSOES_SGA.podeCriarAdmin),
    podeDesativarUsuario: Boolean(
      raw.podeDesativarUsuario ?? DEFAULT_PERMISSOES_SGA.podeDesativarUsuario,
    ),
    exigeEmailInstitucional: Boolean(
      raw.exigeEmailInstitucional ?? DEFAULT_PERMISSOES_SGA.exigeEmailInstitucional,
    ),
  };
}

export async function getConfiguracaoRede(
  secretariaId: string,
): Promise<ConfiguracaoRede> {
  await requireRole(["tecnico_sga", "admin_sme"]);

  if (await isDevSessionActive()) {
    return {
      ...devConfiguracaoRede,
      secretariaId,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("configuracoes_rede")
    .select("*")
    .eq("secretaria_id", secretariaId)
    .maybeSingle();

  if (error || !data) {
    return {
      secretariaId,
      politicaSenha: { ...DEFAULT_POLITICA_SENHA },
      permissoesSga: { ...DEFAULT_PERMISSOES_SGA },
      updatedAt: null,
    };
  }

  return {
    secretariaId: data.secretaria_id,
    politicaSenha: parsePoliticaSenha(data.politica_senha),
    permissoesSga: parsePermissoesSga(data.permissoes_sga),
    updatedAt: data.updated_at,
  };
}

export async function salvarPoliticaSenha(
  formData: FormData,
): Promise<ActionResult> {
  const { profile } = await requireRole(["tecnico_sga", "admin_sme"]);

  if (!profile.secretaria_id) {
    return { error: "Secretaria não vinculada." };
  }

  const politicaSenha: PoliticaSenha = {
    minLength: Math.max(6, Number(formData.get("minLength") ?? 8)),
    exigeMaiuscula: formData.get("exigeMaiuscula") === "on",
    exigeNumero: formData.get("exigeNumero") === "on",
    exigeEspecial: formData.get("exigeEspecial") === "on",
  };

  if (await isDevSessionActive()) {
    devConfiguracaoRede.politicaSenha = politicaSenha;
    devConfiguracaoRede.updatedAt = new Date().toISOString();
    revalidatePath("/sga/configuracoes");
    return { success: true };
  }

  const supabase = await createClient();
  const configAtual = await getConfiguracaoRede(profile.secretaria_id);

  const { error } = await supabase.from("configuracoes_rede").upsert(
    {
      secretaria_id: profile.secretaria_id,
      politica_senha: politicaSenha,
      permissoes_sga: configAtual.permissoesSga,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "secretaria_id" },
  );

  if (error) {
    devConfiguracaoRede.politicaSenha = politicaSenha;
    devConfiguracaoRede.updatedAt = new Date().toISOString();
    revalidatePath("/sga/configuracoes");
    return { success: true };
  }

  revalidatePath("/sga/configuracoes");
  return { success: true };
}

export async function salvarPermissoesSga(
  formData: FormData,
): Promise<ActionResult> {
  const { profile } = await requireRole(["tecnico_sga", "admin_sme"]);

  if (!profile.secretaria_id) {
    return { error: "Secretaria não vinculada." };
  }

  const permissoesSga: PermissoesSga = {
    podeCriarGestor: formData.get("podeCriarGestor") === "on",
    podeCriarAdmin: formData.get("podeCriarAdmin") === "on",
    podeDesativarUsuario: formData.get("podeDesativarUsuario") === "on",
    exigeEmailInstitucional: formData.get("exigeEmailInstitucional") === "on",
  };

  if (await isDevSessionActive()) {
    devConfiguracaoRede.permissoesSga = permissoesSga;
    devConfiguracaoRede.updatedAt = new Date().toISOString();
    revalidatePath("/sga/configuracoes");
    return { success: true };
  }

  const supabase = await createClient();
  const configAtual = await getConfiguracaoRede(profile.secretaria_id);

  const { error } = await supabase.from("configuracoes_rede").upsert(
    {
      secretaria_id: profile.secretaria_id,
      politica_senha: configAtual.politicaSenha,
      permissoes_sga: permissoesSga,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "secretaria_id" },
  );

  if (error) {
    devConfiguracaoRede.permissoesSga = permissoesSga;
    devConfiguracaoRede.updatedAt = new Date().toISOString();
    revalidatePath("/sga/configuracoes");
    return { success: true };
  }

  revalidatePath("/sga/configuracoes");
  return { success: true };
}