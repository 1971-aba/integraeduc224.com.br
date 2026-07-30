"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { cleanCpf, cleanNis, isValidCpf } from "@/lib/secretaria-utils";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string; success?: boolean; alunoId?: string };

function parseAlunoForm(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const cpfRaw = String(formData.get("cpf") ?? "").trim();
  const dataNascimento = String(formData.get("data_nascimento") ?? "").trim();
  const nomeMae = String(formData.get("nome_mae") ?? "").trim();
  const nisRaw = String(formData.get("nis") ?? "").trim();
  const turmaId = String(formData.get("turma_id") ?? "").trim();

  const cpf = cpfRaw ? cleanCpf(cpfRaw) : null;
  const nis = nisRaw ? cleanNis(nisRaw) : null;

  if (!nome || nome.length < 3) {
    return { error: "Informe o nome completo do aluno." } as const;
  }

  if (!nomeMae || nomeMae.length < 3) {
    return { error: "Informe o nome da mãe ou responsável." } as const;
  }

  if (!dataNascimento) {
    return { error: "Informe a data de nascimento." } as const;
  }

  if (cpf && !isValidCpf(cpf)) {
    return { error: "CPF inválido." } as const;
  }

  return {
    data: { nome, cpf, dataNascimento, nomeMae, nis, turmaId: turmaId || null },
  } as const;
}

async function getGestorContext() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const secretariaId = profile.secretaria_id;
  const escolaId = profile.escola_id;

  if (!secretariaId) {
    throw new Error("Perfil sem secretaria vinculada.");
  }

  return { profile, secretariaId, escolaId };
}

async function matricularInterno(
  alunoId: string,
  turmaId: string,
  secretariaId: string,
  escolaId: string | null,
) {
  const supabase = await createClient();

  const { data: turma } = await supabase
    .from("turmas")
    .select("id, escola_id, ano_letivo_id, nome, serie")
    .eq("id", turmaId)
    .single();

  if (!turma) {
    return { error: "Turma não encontrada." };
  }

  if (escolaId && turma.escola_id !== escolaId) {
    return { error: "Turma não pertence à sua escola." };
  }

  const { data: escola } = await supabase
    .from("escolas")
    .select("secretaria_id")
    .eq("id", turma.escola_id)
    .single();

  if (escola?.secretaria_id !== secretariaId) {
    return { error: "Turma fora da sua rede." };
  }

  const { data: matriculaAtiva } = await supabase
    .from("matriculas")
    .select("id, turma_id")
    .eq("aluno_id", alunoId)
    .eq("ano_letivo_id", turma.ano_letivo_id)
    .eq("status", "ativa")
    .maybeSingle();

  if (matriculaAtiva) {
    if (matriculaAtiva.turma_id === turmaId) {
      return { error: "Aluno já está matriculado nesta turma." };
    }
    return {
      error:
        "Aluno já possui matrícula ativa neste ano letivo. Use a transferência.",
    };
  }

  const { error } = await supabase.from("matriculas").insert({
    aluno_id: alunoId,
    turma_id: turmaId,
    ano_letivo_id: turma.ano_letivo_id,
    status: "ativa",
  });

  if (error) {
    return { error: "Não foi possível realizar a matrícula." };
  }

  return { success: true as const };
}

export async function criarAluno(formData: FormData): Promise<ActionResult> {
  const parsed = parseAlunoForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { profile, secretariaId, escolaId } = await getGestorContext();
  const { nome, cpf, dataNascimento, nomeMae, nis, turmaId } = parsed.data;
  const supabase = await createClient();

  if (cpf) {
    const { data: existente } = await supabase
      .from("alunos")
      .select("id")
      .eq("secretaria_id", secretariaId)
      .eq("cpf", cpf)
      .maybeSingle();

    if (existente) {
      return { error: "Já existe um aluno cadastrado com este CPF." };
    }
  }

  const { data: aluno, error } = await supabase
    .from("alunos")
    .insert({
      secretaria_id: secretariaId,
      nome,
      cpf,
      data_nascimento: dataNascimento,
      nome_mae: nomeMae,
      nis,
    })
    .select("id")
    .single();

  if (error || !aluno) {
    return { error: "Não foi possível cadastrar o aluno." };
  }

  if (turmaId) {
    const matricula = await matricularInterno(
      aluno.id,
      turmaId,
      secretariaId,
      profile.role === "gestor_escolar" ? escolaId : null,
    );
    if (matricula.error) {
      return {
        error: `Aluno cadastrado, mas matrícula falhou: ${matricula.error}`,
        alunoId: aluno.id,
      };
    }
  }

  revalidatePath("/gestor/alunos");
  redirect(`/gestor/alunos/${aluno.id}`);
}

export async function atualizarAluno(
  alunoId: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseAlunoForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { secretariaId } = await getGestorContext();
  const { nome, cpf, dataNascimento, nomeMae, nis } = parsed.data;
  const supabase = await createClient();

  if (cpf) {
    const { data: existente } = await supabase
      .from("alunos")
      .select("id")
      .eq("secretaria_id", secretariaId)
      .eq("cpf", cpf)
      .neq("id", alunoId)
      .maybeSingle();

    if (existente) {
      return { error: "Já existe outro aluno com este CPF." };
    }
  }

  const { error } = await supabase
    .from("alunos")
    .update({
      nome,
      cpf,
      data_nascimento: dataNascimento,
      nome_mae: nomeMae,
      nis,
    })
    .eq("id", alunoId)
    .eq("secretaria_id", secretariaId);

  if (error) {
    return { error: "Não foi possível atualizar o aluno." };
  }

  revalidatePath("/gestor/alunos");
  revalidatePath(`/gestor/alunos/${alunoId}`);
  return { success: true };
}

export async function matricularAluno(
  alunoId: string,
  turmaId: string,
): Promise<ActionResult> {
  const { secretariaId, escolaId, profile } = await getGestorContext();

  const result = await matricularInterno(
    alunoId,
    turmaId,
    secretariaId,
    profile.role === "gestor_escolar" ? escolaId : null,
  );

  if (result.error) return { error: result.error };

  revalidatePath("/gestor/alunos");
  revalidatePath(`/gestor/alunos/${alunoId}`);
  return { success: true };
}

export async function transferirAluno(
  alunoId: string,
  matriculaId: string,
  turmaDestinoId: string,
): Promise<ActionResult> {
  const { secretariaId, escolaId, profile } = await getGestorContext();
  const supabase = await createClient();

  const { data: matriculaAtual } = await supabase
    .from("matriculas")
    .select("id, aluno_id, turma_id, ano_letivo_id, status")
    .eq("id", matriculaId)
    .eq("aluno_id", alunoId)
    .eq("status", "ativa")
    .single();

  if (!matriculaAtual) {
    return { error: "Matrícula ativa não encontrada." };
  }

  const { data: turmaDestino } = await supabase
    .from("turmas")
    .select("id, escola_id, ano_letivo_id, nome")
    .eq("id", turmaDestinoId)
    .single();

  if (!turmaDestino) {
    return { error: "Turma de destino não encontrada." };
  }

  if (turmaDestino.ano_letivo_id !== matriculaAtual.ano_letivo_id) {
    return { error: "A transferência deve ocorrer no mesmo ano letivo." };
  }

  if (escolaId && turmaDestino.escola_id !== escolaId) {
    return { error: "Turma de destino não pertence à sua escola." };
  }

  if (turmaDestinoId === matriculaAtual.turma_id) {
    return { error: "Selecione uma turma diferente da atual." };
  }

  const { error: encerrarError } = await supabase
    .from("matriculas")
    .update({ status: "transferido" })
    .eq("id", matriculaId);

  if (encerrarError) {
    return { error: "Não foi possível encerrar a matrícula atual." };
  }

  const { error: novaError } = await supabase.from("matriculas").insert({
    aluno_id: alunoId,
    turma_id: turmaDestinoId,
    ano_letivo_id: turmaDestino.ano_letivo_id,
    status: "ativa",
  });

  if (novaError) {
    await supabase
      .from("matriculas")
      .update({ status: "ativa" })
      .eq("id", matriculaId);
    return { error: "Não foi possível criar a matrícula na turma de destino." };
  }

  revalidatePath("/gestor/alunos");
  revalidatePath(`/gestor/alunos/${alunoId}`);
  return { success: true };
}
