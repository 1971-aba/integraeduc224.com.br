"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import {
  isTipoLocalidade,
  isZonaLocalidade,
} from "@/lib/estrutura-outros-config";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean };

const ESTRUTURA_PATHS = [
  "/gestor/estrutura",
  "/gestor/estrutura/informacoes",
  "/gestor/estrutura/salas/cadastro",
  "/gestor/estrutura/salas/relacao",
  "/gestor/estrutura/bairros",
  "/gestor/estrutura/rotas/cadastro",
  "/gestor/estrutura/rotas/consultar",
];

function revalidarEstrutura() {
  for (const path of ESTRUTURA_PATHS) revalidatePath(path);
}

function textoOuNulo(formData: FormData, campo: string) {
  const valor = String(formData.get(campo) ?? "").trim();
  return valor.length > 0 ? valor : null;
}

async function getEscolaId() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  if (!profile.escola_id) {
    return { error: "Perfil sem escola vinculada." as const };
  }
  return { escolaId: profile.escola_id };
}

export async function salvarInformacoesEscola(
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await getEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  const supabase = await createClient();
  const { error } = await supabase.from("escolas_informacoes").upsert(
    {
      escola_id: ctx.escolaId,
      telefone: textoOuNulo(formData, "telefone"),
      email: textoOuNulo(formData, "email"),
      diretor_nome: textoOuNulo(formData, "diretor_nome"),
      vice_diretor_nome: textoOuNulo(formData, "vice_diretor_nome"),
      secretario_nome: textoOuNulo(formData, "secretario_nome"),
      horario_funcionamento: textoOuNulo(formData, "horario_funcionamento"),
      observacoes: textoOuNulo(formData, "observacoes"),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "escola_id" },
  );

  if (error) return { error: "Não foi possível salvar as informações." };

  revalidarEstrutura();
  return { success: true };
}

export async function salvarLocalidade(
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await getEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  const nome = String(formData.get("nome") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "").trim();
  const zona = String(formData.get("zona") ?? "").trim();

  if (!nome) return { error: "Informe o nome do bairro ou povoado." };
  if (!isTipoLocalidade(tipo)) return { error: "Selecione o tipo." };
  if (!isZonaLocalidade(zona)) return { error: "Selecione a zona." };

  const supabase = await createClient();
  const { error } = await supabase.from("escola_localidades").insert({
    escola_id: ctx.escolaId,
    nome,
    tipo,
    zona,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Este local já está cadastrado nesta escola." };
    }
    return { error: "Não foi possível salvar o local." };
  }

  revalidarEstrutura();
  return { success: true };
}

export async function excluirLocalidade(id: string): Promise<ActionResult> {
  const ctx = await getEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("escola_localidades")
    .delete()
    .eq("id", id)
    .eq("escola_id", ctx.escolaId);

  if (error) return { error: "Não foi possível excluir." };

  revalidarEstrutura();
  return { success: true };
}

export async function salvarRotaOnibus(
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await getEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { error: "Informe o nome da rota." };

  const supabase = await createClient();
  const { error } = await supabase.from("rotas_onibus").insert({
    escola_id: ctx.escolaId,
    nome,
    turno: textoOuNulo(formData, "turno"),
    motorista: textoOuNulo(formData, "motorista"),
    monitor: textoOuNulo(formData, "monitor"),
    observacoes: textoOuNulo(formData, "observacoes"),
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe uma rota com este nome." };
    }
    return { error: "Não foi possível salvar a rota." };
  }

  revalidarEstrutura();
  return { success: true };
}

export async function excluirRotaOnibus(id: string): Promise<ActionResult> {
  const ctx = await getEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("rotas_onibus")
    .delete()
    .eq("id", id)
    .eq("escola_id", ctx.escolaId);

  if (error) return { error: "Não foi possível excluir a rota." };

  revalidarEstrutura();
  return { success: true };
}
