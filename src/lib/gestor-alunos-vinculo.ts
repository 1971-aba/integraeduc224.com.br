import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Situação do aluno da rede em relação a esta escola. Um aluno já matriculado
 * aqui não entra em nenhuma lista.
 */
export type SituacaoVinculo =
  /** Nunca matriculado ou já concluiu: precisa de matrícula. */
  | "matricula"
  /** Saiu transferido de alguma unidade e está sem vínculo. */
  | "transferencia"
  /** Matrícula cancelada: abandono. */
  | "evasao"
  /** Continua ativo em outra unidade da rede. */
  | "ativo_em_outra";

export type AlunoParaVincular = {
  id: string;
  nome: string;
  cpf: string | null;
  dataNascimento: string | null;
  nomeMae: string | null;
  situacao: SituacaoVinculo;
  ultimaMovimentacao: string | null;
  saiuDestaEscola: boolean;
};

export type TurmaDestino = {
  id: string;
  label: string;
};

export type VinculoContexto = {
  escolaNome: string;
  turmas: TurmaDestino[];
  alunos: AlunoParaVincular[];
};

function maisRecente(
  a: { data_matricula: string },
  b: { data_matricula: string },
) {
  return b.data_matricula.localeCompare(a.data_matricula);
}

export async function getContextoVinculo(): Promise<VinculoContexto | null> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id || !profile.secretaria_id) {
    return null;
  }

  const supabase = await createClient();

  const [{ data: escola }, { data: turmas }, { data: alunos }] =
    await Promise.all([
      supabase
        .from("escolas")
        .select("nome")
        .eq("id", profile.escola_id)
        .maybeSingle(),
      supabase
        .from("turmas")
        .select("id, nome, serie, turno")
        .eq("escola_id", profile.escola_id)
        .order("nome"),
      supabase
        .from("alunos")
        .select("id, nome, cpf, data_nascimento, nome_mae")
        .eq("secretaria_id", profile.secretaria_id)
        .order("nome"),
    ]);

  const turmasDaEscola = new Set(turmas?.map((turma) => turma.id) ?? []);
  const alunoIds = alunos?.map((aluno) => aluno.id) ?? [];

  // A política de leitura alcança as matrículas de toda a rede, o que permite
  // saber se o aluno está vinculado a outra unidade.
  const { data: matriculas } = alunoIds.length
    ? await supabase
        .from("matriculas")
        .select("aluno_id, turma_id, status, data_matricula")
        .in("aluno_id", alunoIds)
    : { data: [] };

  const matriculasPorAluno = new Map<
    string,
    { turma_id: string; status: string; data_matricula: string }[]
  >();

  for (const matricula of matriculas ?? []) {
    const lista = matriculasPorAluno.get(matricula.aluno_id) ?? [];
    lista.push(matricula);
    matriculasPorAluno.set(matricula.aluno_id, lista);
  }

  const candidatos: AlunoParaVincular[] = [];

  for (const aluno of alunos ?? []) {
    const historico = (matriculasPorAluno.get(aluno.id) ?? [])
      .slice()
      .sort(maisRecente);

    const ativas = historico.filter((item) => item.status === "ativa");

    if (ativas.some((item) => turmasDaEscola.has(item.turma_id))) {
      continue;
    }

    const ultima = historico[0] ?? null;
    let situacao: SituacaoVinculo;

    if (ativas.length > 0) {
      situacao = "ativo_em_outra";
    } else if (ultima?.status === "transferido") {
      situacao = "transferencia";
    } else if (ultima?.status === "cancelado") {
      situacao = "evasao";
    } else {
      situacao = "matricula";
    }

    candidatos.push({
      id: aluno.id,
      nome: aluno.nome,
      cpf: aluno.cpf,
      dataNascimento: aluno.data_nascimento,
      nomeMae: aluno.nome_mae,
      situacao,
      ultimaMovimentacao: ultima?.data_matricula ?? null,
      saiuDestaEscola: ultima ? turmasDaEscola.has(ultima.turma_id) : false,
    });
  }

  return {
    escolaNome: escola?.nome ?? "Unidade Escolar",
    turmas: (turmas ?? []).map((turma) => ({
      id: turma.id,
      label: `${turma.nome} — ${turma.serie} (${turma.turno})`,
    })),
    alunos: candidatos,
  };
}
