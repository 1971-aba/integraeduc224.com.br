"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import {
  getAtribuicaoForEscola,
  getAtribuicaoForProfessor,
  validateDiaLetivo,
} from "@/lib/diario";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";
import type { PresencaStatus } from "@/lib/diario-utils";
import type { ChamadaTipo } from "@/lib/chamada-tipos";
import { isChamadaTipo } from "@/lib/chamada-tipos";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean };

async function assertChamadaAtribuicao(atribuicaoId: string) {
  const { profile } = await requireRole([
    "professor",
    "gestor_escolar",
    "admin_sme",
  ]);

  if (profile.role === "professor") {
    const atribuicao = await getAtribuicaoForProfessor(
      atribuicaoId,
      profile.id,
    );

    if (!atribuicao) {
      throw new Error("Atribuição não encontrada.");
    }

    return { profile, atribuicao };
  }

  const escolaId = getGestorEscolaId(profile);
  if (!escolaId) {
    throw new Error("Escola não vinculada ao gestor.");
  }

  const atribuicao = await getAtribuicaoForEscola(atribuicaoId, escolaId);
  if (!atribuicao) {
    throw new Error("Atribuição não encontrada.");
  }

  return { profile, atribuicao };
}

async function assertProfessorAtribuicao(atribuicaoId: string) {
  const { profile } = await requireRole(["professor"]);
  const atribuicao = await getAtribuicaoForProfessor(
    atribuicaoId,
    profile.id,
  );

  if (!atribuicao) {
    throw new Error("Atribuição não encontrada.");
  }

  return { profile, atribuicao };
}

export async function salvarChamada(
  atribuicaoId: string,
  data: string,
  registros: Array<{ matriculaId: string; status: PresencaStatus }>,
  options?: {
    tipo?: ChamadaTipo;
    observacao?: string;
    permitirCorrecao?: boolean;
  },
): Promise<ActionResult> {
  try {
    const tipo = options?.tipo ?? "regular";
    if (!isChamadaTipo(tipo)) {
      return { error: "Tipo de frequência inválido." };
    }

    const { profile, atribuicao } =
      await assertChamadaAtribuicao(atribuicaoId);

    if (!options?.permitirCorrecao) {
      const diaLetivo = await validateDiaLetivo(data, atribuicao.ano_letivo_id);
      if (!diaLetivo) {
        return { error: "A data selecionada não é um dia letivo válido." };
      }
    }

    if (registros.length === 0) {
      return { error: "Nenhum aluno para registrar chamada." };
    }

    const supabase = await createClient();
    const observacao = options?.observacao?.trim() || null;

    const { data: chamada, error: chamadaError } = await supabase
      .from("chamadas")
      .upsert(
        {
          atribuicao_id: atribuicaoId,
          data,
          tipo,
          observacao,
          created_by: profile.id,
        },
        { onConflict: "atribuicao_id,data,tipo" },
      )
      .select("id")
      .single();

    if (chamadaError || !chamada) {
      return { error: "Não foi possível salvar a chamada." };
    }

    const { error: freqError } = await supabase
      .from("registros_frequencia")
      .upsert(
        registros.map((registro) => ({
          chamada_id: chamada.id,
          matricula_id: registro.matriculaId,
          status: registro.status,
        })),
        { onConflict: "chamada_id,matricula_id" },
      );

    if (freqError) {
      return { error: "Não foi possível salvar a frequência." };
    }

    revalidatePath(`/professor/turma/${atribuicaoId}/chamada`);
    revalidatePath("/professor/frequencia/turma");
    revalidatePath("/professor/frequencia/corrigir");
    revalidatePath(`/professor/frequencia/corrigir/${atribuicaoId}`);
    revalidatePath("/professor/frequencia/atividade-complementar");
    revalidatePath("/professor/frequencia/aee");
    revalidatePath("/gestor/consultas/sala-de-aula/frequencia-turma/realizar");
    revalidatePath("/gestor/consultas/sala-de-aula/frequencia-turma/realizar/turma");
    revalidatePath(
      `/gestor/consultas/sala-de-aula/frequencia-turma/realizar/turma/${atribuicaoId}`,
    );
    revalidatePath("/gestor/consultas/sala-de-aula/frequencia-turma/corrigir");
    revalidatePath(
      `/gestor/consultas/sala-de-aula/frequencia-turma/corrigir/${atribuicaoId}`,
    );
    revalidatePath("/gestor/consultas/frequencia");
    return { success: true };
  } catch {
    return { error: "Erro ao salvar chamada." };
  }
}

export async function salvarNotas(
  atribuicaoId: string,
  bimestreId: string,
  notas: Array<{
    matriculaId: string;
    nota: number | null;
    recuperacao: number | null;
  }>,
): Promise<ActionResult> {
  try {
    await assertProfessorAtribuicao(atribuicaoId);

    for (const item of notas) {
      if (item.nota !== null && (item.nota < 0 || item.nota > 10)) {
        return { error: "Notas devem estar entre 0 e 10." };
      }
      if (
        item.recuperacao !== null &&
        (item.recuperacao < 0 || item.recuperacao > 10)
      ) {
        return { error: "Recuperação deve estar entre 0 e 10." };
      }
    }

    const supabase = await createClient();

    const payload = notas
      .filter(
        (item) => item.nota !== null || item.recuperacao !== null,
      )
      .map((item) => ({
        atribuicao_id: atribuicaoId,
        bimestre_id: bimestreId,
        matricula_id: item.matriculaId,
        nota: item.nota,
        recuperacao: item.recuperacao,
      }));

    if (payload.length === 0) {
      return { error: "Informe ao menos uma nota." };
    }

    const { error } = await supabase.from("notas").upsert(payload, {
      onConflict: "atribuicao_id,matricula_id,bimestre_id",
    });

    if (error) {
      return { error: "Não foi possível salvar as notas." };
    }

    revalidatePath(`/professor/turma/${atribuicaoId}/notas`);
    return { success: true };
  } catch {
    return { error: "Erro ao salvar notas." };
  }
}

export async function salvarConteudo(
  atribuicaoId: string,
  data: string,
  descricao: string,
): Promise<ActionResult> {
  try {
    const { profile, atribuicao } =
      await assertProfessorAtribuicao(atribuicaoId);

    const diaLetivo = await validateDiaLetivo(data, atribuicao.ano_letivo_id);
    if (!diaLetivo) {
      return { error: "A data selecionada não é um dia letivo válido." };
    }

    const texto = descricao.trim();
    if (texto.length < 10) {
      return { error: "Descreva o conteúdo com pelo menos 10 caracteres." };
    }

    const supabase = await createClient();

    const { error } = await supabase.from("conteudos_diarios").upsert(
      {
        atribuicao_id: atribuicaoId,
        data,
        descricao: texto,
        created_by: profile.id,
      },
      { onConflict: "atribuicao_id,data" },
    );

    if (error) {
      return { error: "Não foi possível salvar o conteúdo." };
    }

    revalidatePath(`/professor/turma/${atribuicaoId}/conteudo`);
    return { success: true };
  } catch {
    return { error: "Erro ao salvar conteúdo." };
  }
}

export async function criarAtribuicao(formData: FormData): Promise<ActionResult> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  const professorId = String(formData.get("professor_id") ?? "");
  const disciplinaId = String(formData.get("disciplina_id") ?? "");
  const turmaId = String(formData.get("turma_id") ?? "");
  const anoLetivoId = String(formData.get("ano_letivo_id") ?? "");

  if (!professorId || !disciplinaId || !turmaId || !anoLetivoId) {
    return { error: "Preencha todos os campos." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("atribuicoes_docentes").insert({
    professor_id: professorId,
    disciplina_id: disciplinaId,
    turma_id: turmaId,
    ano_letivo_id: anoLetivoId,
  });

  if (error) {
    return { error: "Não foi possível criar a atribuição." };
  }

  revalidatePath("/gestor/atribuicoes");
  return { success: true };
}

export async function excluirAtribuicao(
  atribuicaoId: string,
): Promise<ActionResult> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();

  const { data: atribuicao } = await supabase
    .from("atribuicoes_docentes")
    .select("id, turma_id")
    .eq("id", atribuicaoId)
    .maybeSingle();

  if (!atribuicao) {
    return { error: "Atribuição não encontrada." };
  }

  const { data: turma } = await supabase
    .from("turmas")
    .select("id, escola_id")
    .eq("id", atribuicao.turma_id)
    .maybeSingle();

  if (!turma) {
    return { error: "Turma vinculada não encontrada." };
  }

  if (profile.role === "gestor_escolar") {
    if (!profile.escola_id || profile.escola_id !== turma.escola_id) {
      return { error: "Atribuição fora da sua escola." };
    }
  } else if (profile.secretaria_id) {
    const { data: escola } = await supabase
      .from("escolas")
      .select("secretaria_id")
      .eq("id", turma.escola_id)
      .maybeSingle();

    if (escola?.secretaria_id !== profile.secretaria_id) {
      return { error: "Atribuição fora da sua rede." };
    }
  }

  const [
    { count: chamadas },
    { count: conteudos },
    { count: notas },
    { count: planos },
  ] = await Promise.all([
    supabase
      .from("chamadas")
      .select("id", { count: "exact", head: true })
      .eq("atribuicao_id", atribuicaoId),
    supabase
      .from("conteudos_diarios")
      .select("id", { count: "exact", head: true })
      .eq("atribuicao_id", atribuicaoId),
    supabase
      .from("notas")
      .select("id", { count: "exact", head: true })
      .eq("atribuicao_id", atribuicaoId),
    supabase
      .from("planos_aula")
      .select("id", { count: "exact", head: true })
      .eq("atribuicao_id", atribuicaoId),
  ]);

  const registrosVinculados =
    (chamadas ?? 0) +
    (conteudos ?? 0) +
    (notas ?? 0) +
    (planos ?? 0);

  if (registrosVinculados > 0) {
    return {
      error:
        "Não é possível excluir: já existem registros de diário, notas ou planos vinculados.",
    };
  }

  const { error } = await supabase
    .from("atribuicoes_docentes")
    .delete()
    .eq("id", atribuicaoId);

  if (error) {
    return { error: "Não foi possível excluir a atribuição." };
  }

  revalidatePath("/gestor/atribuicoes");
  revalidatePath("/gestor/turmas");
  revalidatePath("/professor");
  return { success: true };
}
