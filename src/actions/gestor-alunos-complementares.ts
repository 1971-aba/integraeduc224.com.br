"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import {
  BUCKET_FOTOS_ALUNOS,
  CORES_RACA,
  FOTO_TAMANHO_MAXIMO,
  FOTO_TIPOS_ACEITOS,
} from "@/lib/alunos-complementares-config";
import { isDevProfileId } from "@/lib/dev-auth";
import { createClient } from "@/lib/supabase/server";
import type { CorRaca } from "@/types/database";

type ActionResult = { error?: string; success?: boolean };

function revalidarComplementares() {
  revalidatePath("/gestor/alunos/outras-opcoes/complementares/cor-raca");
  revalidatePath("/gestor/alunos/outras-opcoes/complementares/fotografia");
  revalidatePath("/gestor/alunos/carteirinhas");
}

function isCorRaca(valor: string): valor is CorRaca {
  return valor in CORES_RACA;
}

/** Garante que o aluno pertence à rede do gestor antes de qualquer escrita. */
async function validarAluno(alunoId: string) {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.secretaria_id) {
    return { error: "Perfil sem secretaria vinculada." as const };
  }

  const supabase = await createClient();
  const { data: aluno } = await supabase
    .from("alunos")
    .select("id, secretaria_id")
    .eq("id", alunoId)
    .maybeSingle();

  if (!aluno || aluno.secretaria_id !== profile.secretaria_id) {
    return { error: "Aluno não encontrado na sua rede." as const };
  }

  return { profile };
}

export async function salvarCorRaca(
  alunoId: string,
  formData: FormData,
): Promise<ActionResult> {
  const validacao = await validarAluno(alunoId);
  if ("error" in validacao) return { error: validacao.error };

  const corRacaBruta = String(formData.get("cor_raca") ?? "").trim();
  const etnia = String(formData.get("etnia_indigena") ?? "").trim();

  if (corRacaBruta && !isCorRaca(corRacaBruta)) {
    return { error: "Selecione uma opção válida de cor/raça." };
  }

  const corRaca = corRacaBruta ? (corRacaBruta as CorRaca) : null;

  if (etnia && corRaca !== "indigena") {
    return {
      error: "A etnia só se aplica a alunos declarados como indígenas.",
    };
  }

  const supabase = await createClient();
  const { profile } = validacao;

  const { error } = await supabase.from("alunos_complementares").upsert(
    {
      aluno_id: alunoId,
      cor_raca: corRaca,
      etnia_indigena: etnia || null,
      atualizado_por: isDevProfileId(profile.id) ? null : profile.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "aluno_id" },
  );

  if (error) {
    return { error: "Não foi possível salvar a informação." };
  }

  revalidarComplementares();
  return { success: true };
}

export async function salvarFotoAluno(
  alunoId: string,
  formData: FormData,
): Promise<ActionResult> {
  const validacao = await validarAluno(alunoId);
  if ("error" in validacao) return { error: validacao.error };

  const { profile } = validacao;

  if (!profile.escola_id) {
    return { error: "Perfil sem escola vinculada." };
  }

  const arquivo = formData.get("foto");

  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { error: "Selecione uma imagem." };
  }

  if (!FOTO_TIPOS_ACEITOS.includes(arquivo.type)) {
    return { error: "A foto deve estar em JPG, PNG ou WebP." };
  }

  if (arquivo.size > FOTO_TAMANHO_MAXIMO) {
    return { error: "A foto deve ter no máximo 2 MB." };
  }

  const supabase = await createClient();

  const extensoes: Record<string, string> = {
    "image/png": "png",
    "image/webp": "webp",
    "image/jpeg": "jpg",
  };
  const caminho = `${profile.escola_id}/${alunoId}.${extensoes[arquivo.type]}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_FOTOS_ALUNOS)
    .upload(caminho, arquivo, { upsert: true, contentType: arquivo.type });

  if (uploadError) {
    return { error: "Não foi possível enviar a foto." };
  }

  const { error } = await supabase.from("alunos_complementares").upsert(
    {
      aluno_id: alunoId,
      foto_path: caminho,
      atualizado_por: isDevProfileId(profile.id) ? null : profile.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "aluno_id" },
  );

  if (error) {
    return { error: "A foto foi enviada, mas o cadastro não foi atualizado." };
  }

  revalidarComplementares();
  return { success: true };
}

export async function removerFotoAluno(
  alunoId: string,
): Promise<ActionResult> {
  const validacao = await validarAluno(alunoId);
  if ("error" in validacao) return { error: validacao.error };

  const supabase = await createClient();

  const { data: complementar } = await supabase
    .from("alunos_complementares")
    .select("foto_path")
    .eq("aluno_id", alunoId)
    .maybeSingle();

  if (complementar?.foto_path) {
    await supabase.storage
      .from(BUCKET_FOTOS_ALUNOS)
      .remove([complementar.foto_path]);
  }

  const { error } = await supabase
    .from("alunos_complementares")
    .update({ foto_path: null, updated_at: new Date().toISOString() })
    .eq("aluno_id", alunoId);

  if (error) {
    return { error: "Não foi possível remover a foto." };
  }

  revalidarComplementares();
  return { success: true };
}
