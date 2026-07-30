"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import {
  isMotivoSaidaExAluno,
} from "@/lib/alunos-escolares-config";
import { SERIES_ESCOLARES } from "@/lib/ai/config";
import { cleanCpf, cleanNis, isValidCpf } from "@/lib/secretaria-utils";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean; alunoId?: string };

export async function cadastrarExAluno(
  formData: FormData,
): Promise<ActionResult> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.secretaria_id) {
    return { error: "Perfil sem secretaria vinculada." };
  }

  if (!profile.escola_id) {
    return { error: "Cadastre o ex-aluno vinculado à sua unidade escolar." };
  }

  const nome = String(formData.get("nome") ?? "").trim();
  const cpfRaw = String(formData.get("cpf") ?? "").trim();
  const dataNascimento = String(formData.get("data_nascimento") ?? "").trim();
  const nomeMae = String(formData.get("nome_mae") ?? "").trim();
  const nisRaw = String(formData.get("nis") ?? "").trim();
  const ultimaSerie = String(formData.get("ultima_serie") ?? "").trim();
  const anoConclusaoBruto = String(formData.get("ano_conclusao") ?? "").trim();
  const motivo = String(formData.get("motivo_saida") ?? "").trim();

  const cpf = cpfRaw ? cleanCpf(cpfRaw) : null;
  const nis = nisRaw ? cleanNis(nisRaw) : null;

  if (!nome || nome.length < 3) {
    return { error: "Informe o nome completo do ex-aluno." };
  }

  if (!nomeMae || nomeMae.length < 3) {
    return { error: "Informe o nome da mãe ou responsável." };
  }

  if (!dataNascimento) {
    return { error: "Informe a data de nascimento." };
  }

  if (!ultimaSerie || !SERIES_ESCOLARES.includes(ultimaSerie as never)) {
    return { error: "Selecione a última série cursada." };
  }

  if (!isMotivoSaidaExAluno(motivo)) {
    return { error: "Selecione o motivo da saída." };
  }

  const anoConclusao = anoConclusaoBruto ? Number(anoConclusaoBruto) : null;

  if (
    !anoConclusao ||
    !Number.isInteger(anoConclusao) ||
    anoConclusao < 1950 ||
    anoConclusao > new Date().getFullYear()
  ) {
    return { error: "Informe o ano de conclusão ou saída." };
  }

  if (cpf && !isValidCpf(cpf)) {
    return { error: "CPF inválido." };
  }

  const supabase = await createClient();

  if (cpf) {
    const { data: existente } = await supabase
      .from("alunos")
      .select("id, tipo_cadastro")
      .eq("secretaria_id", profile.secretaria_id)
      .eq("cpf", cpf)
      .maybeSingle();

    if (existente) {
      if (existente.tipo_cadastro === "ex_aluno") {
        return { error: "Este CPF já consta como ex-aluno na rede." };
      }

      return {
        error:
          "Já existe um aluno ativo com este CPF. Use Vincular Aluno Externo se precisar rematriculá-lo.",
      };
    }
  }

  const { data: aluno, error } = await supabase
    .from("alunos")
    .insert({
      secretaria_id: profile.secretaria_id,
      nome,
      cpf,
      data_nascimento: dataNascimento,
      nome_mae: nomeMae,
      nis,
      tipo_cadastro: "ex_aluno",
      ultima_serie: ultimaSerie,
      ano_conclusao: anoConclusao,
      motivo_saida: motivo,
      escola_origem_id: profile.escola_id,
    })
    .select("id")
    .single();

  if (error || !aluno) {
    return { error: "Não foi possível cadastrar o ex-aluno." };
  }

  revalidatePath("/gestor/alunos/outras-opcoes/ex-aluno");
  redirect(`/gestor/alunos/${aluno.id}`);
}
