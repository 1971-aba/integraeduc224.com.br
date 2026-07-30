"use server";

import { revalidatePath } from "next/cache";

import { isDevSessionActive, requireRole } from "@/lib/auth";
import {
  devAlmoxarifadoItens,
  devEstruturaEscolar,
} from "@/lib/dev-gestor-modulos";
import type {
  AlmoxarifadoItem,
  EstruturaEscolarItem,
  EstruturaTipo,
} from "@/lib/gestor-modulos-types";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean };

async function getGestorEscolaId() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return { error: "Escola não vinculada ao gestor." as const };
  }

  return { profile, escolaId: profile.escola_id };
}

export async function listAlmoxarifadoItens(
  escolaId: string,
): Promise<AlmoxarifadoItem[]> {
  await requireRole(["gestor_escolar", "admin_sme"]);

  if (await isDevSessionActive()) {
    return devAlmoxarifadoItens
      .filter((item) => item.escolaId === escolaId)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("almoxarifado_itens")
    .select("*")
    .eq("escola_id", escolaId)
    .order("nome");

  if (error) {
    return devAlmoxarifadoItens.filter((item) => item.escolaId === escolaId);
  }

  return (
    data?.map((item) => ({
      id: item.id,
      escolaId: item.escola_id,
      nome: item.nome,
      categoria: item.categoria,
      quantidade: Number(item.quantidade),
      unidade: item.unidade,
      estoqueMinimo: Number(item.estoque_minimo),
      createdAt: item.created_at,
    })) ?? []
  );
}

export async function criarAlmoxarifadoItem(
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  const nome = String(formData.get("nome") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "geral");
  const quantidade = Number(formData.get("quantidade") ?? 0);
  const unidade = String(formData.get("unidade") ?? "un").trim();
  const estoqueMinimo = Number(formData.get("estoque_minimo") ?? 0);

  if (!nome) return { error: "Informe o nome do item." };
  if (quantidade < 0 || estoqueMinimo < 0) {
    return { error: "Quantidades inválidas." };
  }

  const item: AlmoxarifadoItem = {
    id: crypto.randomUUID(),
    escolaId: ctx.escolaId,
    nome,
    categoria,
    quantidade,
    unidade,
    estoqueMinimo,
    createdAt: new Date().toISOString(),
  };

  if (await isDevSessionActive()) {
    devAlmoxarifadoItens.unshift(item);
    revalidatePath("/gestor/almoxarifado");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("almoxarifado_itens").insert({
    escola_id: ctx.escolaId,
    nome,
    categoria,
    quantidade,
    unidade,
    estoque_minimo: estoqueMinimo,
  });

  if (error) {
    devAlmoxarifadoItens.unshift(item);
    revalidatePath("/gestor/almoxarifado");
    return { success: true };
  }

  revalidatePath("/gestor/almoxarifado");
  return { success: true };
}

export async function movimentarAlmoxarifadoItem(
  itemId: string,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  const tipo = String(formData.get("tipo") ?? "") as "entrada" | "saida";
  const quantidade = Number(formData.get("quantidade") ?? 0);
  const motivo = String(formData.get("motivo") ?? "").trim() || null;

  if (!["entrada", "saida"].includes(tipo)) {
    return { error: "Tipo de movimentação inválido." };
  }
  if (quantidade <= 0) return { error: "Informe a quantidade." };

  if (await isDevSessionActive()) {
    const item = devAlmoxarifadoItens.find(
      (i) => i.id === itemId && i.escolaId === ctx.escolaId,
    );
    if (!item) return { error: "Item não encontrado." };
    if (tipo === "saida" && item.quantidade < quantidade) {
      return { error: "Estoque insuficiente." };
    }
    item.quantidade += tipo === "entrada" ? quantidade : -quantidade;
    revalidatePath("/gestor/almoxarifado");
    return { success: true };
  }

  const supabase = await createClient();

  const { data: item } = await supabase
    .from("almoxarifado_itens")
    .select("*")
    .eq("id", itemId)
    .eq("escola_id", ctx.escolaId)
    .maybeSingle();

  if (!item) return { error: "Item não encontrado." };

  const qtdAtual = Number(item.quantidade);
  if (tipo === "saida" && qtdAtual < quantidade) {
    return { error: "Estoque insuficiente." };
  }

  const novaQtd = tipo === "entrada" ? qtdAtual + quantidade : qtdAtual - quantidade;

  const { error: movError } = await supabase
    .from("almoxarifado_movimentos")
    .insert({
      item_id: itemId,
      tipo,
      quantidade,
      motivo,
      created_by: ctx.profile.id,
    });

  if (movError) {
    const devItem = devAlmoxarifadoItens.find((i) => i.id === itemId);
    if (devItem) {
      devItem.quantidade = novaQtd;
      revalidatePath("/gestor/almoxarifado");
      return { success: true };
    }
    return { error: "Não foi possível registrar a movimentação." };
  }

  await supabase
    .from("almoxarifado_itens")
    .update({ quantidade: novaQtd })
    .eq("id", itemId);

  revalidatePath("/gestor/almoxarifado");
  return { success: true };
}

export async function excluirAlmoxarifadoItem(
  itemId: string,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  if (await isDevSessionActive()) {
    const index = devAlmoxarifadoItens.findIndex(
      (i) => i.id === itemId && i.escolaId === ctx.escolaId,
    );
    if (index >= 0) devAlmoxarifadoItens.splice(index, 1);
    revalidatePath("/gestor/almoxarifado");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("almoxarifado_itens")
    .delete()
    .eq("id", itemId)
    .eq("escola_id", ctx.escolaId);

  if (error) return { error: "Não foi possível excluir o item." };

  revalidatePath("/gestor/almoxarifado");
  return { success: true };
}

export async function listEstruturaEscolar(
  escolaId: string,
): Promise<EstruturaEscolarItem[]> {
  await requireRole(["gestor_escolar", "admin_sme"]);

  if (await isDevSessionActive()) {
    return devEstruturaEscolar
      .filter((item) => item.escolaId === escolaId)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("estrutura_escolar")
    .select("*")
    .eq("escola_id", escolaId)
    .order("nome");

  if (error) {
    return devEstruturaEscolar.filter((item) => item.escolaId === escolaId);
  }

  return (
    data?.map((item) => ({
      id: item.id,
      escolaId: item.escola_id,
      tipo: item.tipo as EstruturaTipo,
      nome: item.nome,
      capacidade: item.capacidade,
      descricao: item.descricao,
      createdAt: item.created_at,
    })) ?? []
  );
}

export async function criarEstruturaEscolar(
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  const nome = String(formData.get("nome") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "sala") as EstruturaTipo;
  const capacidadeRaw = String(formData.get("capacidade") ?? "").trim();
  const capacidade = capacidadeRaw ? Number(capacidadeRaw) : null;
  const descricao = String(formData.get("descricao") ?? "").trim() || null;

  if (!nome) return { error: "Informe o nome." };

  const registro: EstruturaEscolarItem = {
    id: crypto.randomUUID(),
    escolaId: ctx.escolaId,
    tipo,
    nome,
    capacidade,
    descricao,
    createdAt: new Date().toISOString(),
  };

  if (await isDevSessionActive()) {
    devEstruturaEscolar.unshift(registro);
    revalidatePath("/gestor/estrutura");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("estrutura_escolar").insert({
    escola_id: ctx.escolaId,
    tipo,
    nome,
    capacidade,
    descricao,
  });

  if (error) {
    devEstruturaEscolar.unshift(registro);
    revalidatePath("/gestor/estrutura");
    return { success: true };
  }

  revalidatePath("/gestor/estrutura");
  return { success: true };
}

export async function excluirEstruturaEscolar(
  estruturaId: string,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  if (await isDevSessionActive()) {
    const index = devEstruturaEscolar.findIndex(
      (i) => i.id === estruturaId && i.escolaId === ctx.escolaId,
    );
    if (index >= 0) devEstruturaEscolar.splice(index, 1);
    revalidatePath("/gestor/estrutura");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("estrutura_escolar")
    .delete()
    .eq("id", estruturaId)
    .eq("escola_id", ctx.escolaId);

  if (error) return { error: "Não foi possível excluir." };

  revalidatePath("/gestor/estrutura");
  return { success: true };
}
