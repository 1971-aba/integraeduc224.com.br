"use server";

import { revalidatePath } from "next/cache";

import { isDevSessionActive, requireRole } from "@/lib/auth";
import {
  devEscalaVigilantes,
  devMerendaEstoque,
  devMerendaRegistros,
} from "@/lib/dev-gestor-modulos";
import type {
  EscalaVigilante,
  MerendaEstoqueItem,
  MerendaRegistro,
  RefeicaoMerenda,
  TurnoVigilancia,
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

const MERENDA_PATHS = [
  "/gestor/merenda",
  "/gestor/merenda/estoque",
  "/gestor/merenda/cardapios",
];

function revalidarMerenda() {
  for (const path of MERENDA_PATHS) revalidatePath(path);
}

export async function listEscalaVigilantes(
  escolaId: string,
  data?: string,
): Promise<EscalaVigilante[]> {
  await requireRole(["gestor_escolar", "admin_sme"]);

  if (await isDevSessionActive()) {
    let list = devEscalaVigilantes.filter((item) => item.escolaId === escolaId);
    if (data) list = list.filter((item) => item.data === data);
    return list.sort((a, b) => a.data.localeCompare(b.data));
  }

  const supabase = await createClient();
  let query = supabase
    .from("escala_vigilantes")
    .select("*")
    .eq("escola_id", escolaId)
    .order("data", { ascending: false });

  if (data) query = query.eq("data", data);

  const { data: rows, error } = await query;

  if (error) {
    return devEscalaVigilantes.filter((item) => item.escolaId === escolaId);
  }

  return (
    rows?.map((item) => ({
      id: item.id,
      escolaId: item.escola_id,
      data: item.data,
      turno: item.turno as TurnoVigilancia,
      vigilanteNome: item.vigilante_nome,
      observacao: item.observacao,
      createdAt: item.created_at,
    })) ?? []
  );
}

export async function criarEscalaVigilante(
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  const data = String(formData.get("data") ?? "").trim();
  const turno = String(formData.get("turno") ?? "manha") as TurnoVigilancia;
  const vigilanteNome = String(formData.get("vigilante_nome") ?? "").trim();
  const observacao = String(formData.get("observacao") ?? "").trim() || null;

  if (!data) return { error: "Informe a data." };
  if (!vigilanteNome) return { error: "Informe o nome do vigilante." };

  const registro: EscalaVigilante = {
    id: crypto.randomUUID(),
    escolaId: ctx.escolaId,
    data,
    turno,
    vigilanteNome,
    observacao,
    createdAt: new Date().toISOString(),
  };

  if (await isDevSessionActive()) {
    devEscalaVigilantes.unshift(registro);
    revalidatePath("/gestor/vigilantes");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("escala_vigilantes").insert({
    escola_id: ctx.escolaId,
    data,
    turno,
    vigilante_nome: vigilanteNome,
    observacao,
    created_by: ctx.profile.id,
  });

  if (error) {
    devEscalaVigilantes.unshift(registro);
    revalidatePath("/gestor/vigilantes");
    return { success: true };
  }

  revalidatePath("/gestor/vigilantes");
  return { success: true };
}

export async function excluirEscalaVigilante(
  escalaId: string,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  if (await isDevSessionActive()) {
    const index = devEscalaVigilantes.findIndex(
      (item) => item.id === escalaId && item.escolaId === ctx.escolaId,
    );
    if (index >= 0) devEscalaVigilantes.splice(index, 1);
    revalidatePath("/gestor/vigilantes");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("escala_vigilantes")
    .delete()
    .eq("id", escalaId)
    .eq("escola_id", ctx.escolaId);

  if (error) return { error: "Não foi possível excluir o registro." };

  revalidatePath("/gestor/vigilantes");
  return { success: true };
}

export async function listMerendaRegistros(
  escolaId: string,
): Promise<MerendaRegistro[]> {
  await requireRole(["gestor_escolar", "admin_sme"]);

  if (await isDevSessionActive()) {
    return devMerendaRegistros
      .filter((item) => item.escolaId === escolaId)
      .sort((a, b) => b.data.localeCompare(a.data));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("merenda_registros")
    .select("*")
    .eq("escola_id", escolaId)
    .order("data", { ascending: false });

  if (error) {
    return devMerendaRegistros.filter((item) => item.escolaId === escolaId);
  }

  return (
    data?.map((item) => ({
      id: item.id,
      escolaId: item.escola_id,
      data: item.data,
      refeicao: item.refeicao as RefeicaoMerenda,
      cardapio: item.cardapio,
      qtdAlunos: item.qtd_alunos,
      observacao: item.observacao,
      createdAt: item.created_at,
    })) ?? []
  );
}

export async function criarMerendaRegistro(
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  const data = String(formData.get("data") ?? "").trim();
  const refeicao = String(formData.get("refeicao") ?? "almoco") as RefeicaoMerenda;
  const cardapio = String(formData.get("cardapio") ?? "").trim();
  const qtdAlunos = Number(formData.get("qtd_alunos") ?? 0);
  const observacao = String(formData.get("observacao") ?? "").trim() || null;

  if (!data) return { error: "Informe a data." };
  if (!cardapio) return { error: "Informe o cardápio." };
  if (qtdAlunos < 0) return { error: "Quantidade inválida." };

  const registro: MerendaRegistro = {
    id: crypto.randomUUID(),
    escolaId: ctx.escolaId,
    data,
    refeicao,
    cardapio,
    qtdAlunos,
    observacao,
    createdAt: new Date().toISOString(),
  };

  if (await isDevSessionActive()) {
    devMerendaRegistros.unshift(registro);
    revalidarMerenda();
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("merenda_registros").insert({
    escola_id: ctx.escolaId,
    data,
    refeicao,
    cardapio,
    qtd_alunos: qtdAlunos,
    observacao,
    created_by: ctx.profile.id,
  });

  if (error) {
    devMerendaRegistros.unshift(registro);
    revalidarMerenda();
    return { success: true };
  }

  revalidarMerenda();
  return { success: true };
}

export async function excluirMerendaRegistro(
  registroId: string,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  if (await isDevSessionActive()) {
    const index = devMerendaRegistros.findIndex(
      (item) => item.id === registroId && item.escolaId === ctx.escolaId,
    );
    if (index >= 0) devMerendaRegistros.splice(index, 1);
    revalidarMerenda();
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("merenda_registros")
    .delete()
    .eq("id", registroId)
    .eq("escola_id", ctx.escolaId);

  if (error) return { error: "Não foi possível excluir o registro." };

  revalidarMerenda();
  return { success: true };
}

export async function listMerendaEstoque(
  escolaId: string,
): Promise<MerendaEstoqueItem[]> {
  await requireRole(["gestor_escolar", "admin_sme"]);

  if (await isDevSessionActive()) {
    return devMerendaEstoque
      .filter((item) => item.escolaId === escolaId)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("merenda_estoque")
    .select("*")
    .eq("escola_id", escolaId)
    .order("nome");

  if (error) {
    return devMerendaEstoque.filter((item) => item.escolaId === escolaId);
  }

  return (
    data?.map((item) => ({
      id: item.id,
      escolaId: item.escola_id,
      nome: item.nome,
      quantidade: Number(item.quantidade),
      unidade: item.unidade,
      estoqueMinimo: Number(item.estoque_minimo),
      validade: item.validade,
      createdAt: item.created_at,
    })) ?? []
  );
}

export async function criarMerendaEstoqueItem(
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  const nome = String(formData.get("nome") ?? "").trim();
  const quantidade = Number(formData.get("quantidade") ?? 0);
  const unidade = String(formData.get("unidade") ?? "kg").trim();
  const estoqueMinimo = Number(formData.get("estoque_minimo") ?? 0);
  const validade = String(formData.get("validade") ?? "").trim() || null;

  if (!nome) return { error: "Informe o nome do insumo." };
  if (quantidade < 0 || estoqueMinimo < 0) {
    return { error: "Quantidades inválidas." };
  }

  const item: MerendaEstoqueItem = {
    id: crypto.randomUUID(),
    escolaId: ctx.escolaId,
    nome,
    quantidade,
    unidade,
    estoqueMinimo,
    validade,
    createdAt: new Date().toISOString(),
  };

  if (await isDevSessionActive()) {
    devMerendaEstoque.unshift(item);
    revalidarMerenda();
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("merenda_estoque").insert({
    escola_id: ctx.escolaId,
    nome,
    quantidade,
    unidade,
    estoque_minimo: estoqueMinimo,
    validade,
  });

  if (error) {
    devMerendaEstoque.unshift(item);
    revalidarMerenda();
    return { success: true };
  }

  revalidarMerenda();
  return { success: true };
}

export async function excluirMerendaEstoqueItem(
  itemId: string,
): Promise<ActionResult> {
  const ctx = await getGestorEscolaId();
  if ("error" in ctx) return { error: ctx.error };

  if (await isDevSessionActive()) {
    const index = devMerendaEstoque.findIndex(
      (item) => item.id === itemId && item.escolaId === ctx.escolaId,
    );
    if (index >= 0) devMerendaEstoque.splice(index, 1);
    revalidarMerenda();
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("merenda_estoque")
    .delete()
    .eq("id", itemId)
    .eq("escola_id", ctx.escolaId);

  if (error) return { error: "Não foi possível excluir o item." };

  revalidarMerenda();
  return { success: true };
}
