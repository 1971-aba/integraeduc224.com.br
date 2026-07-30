import { requireRole } from "@/lib/auth";
import type {
  AlunoComResponsaveis,
  ResponsavelAluno,
} from "@/lib/responsaveis-config";
import { createClient } from "@/lib/supabase/server";

export type ContextoResponsaveis = {
  escolaNome: string;
  alunos: AlunoComResponsaveis[];
};

function mapearResponsavel(
  row: {
    id: string;
    aluno_id: string;
    nome: string;
    parentesco: ResponsavelAluno["parentesco"];
    cpf: string | null;
    rg: string | null;
    telefone: string | null;
    telefone_alt: string | null;
    email: string | null;
    endereco: string | null;
    bairro: string | null;
    cep: string | null;
    local_trabalho: string | null;
    telefone_trabalho: string | null;
    responsavel_legal: boolean;
    autorizado_retirar: boolean;
    observacoes: string | null;
  },
): ResponsavelAluno {
  return {
    id: row.id,
    alunoId: row.aluno_id,
    nome: row.nome,
    parentesco: row.parentesco,
    cpf: row.cpf,
    rg: row.rg,
    telefone: row.telefone,
    telefoneAlt: row.telefone_alt,
    email: row.email,
    endereco: row.endereco,
    bairro: row.bairro,
    cep: row.cep,
    localTrabalho: row.local_trabalho,
    telefoneTrabalho: row.telefone_trabalho,
    responsavelLegal: row.responsavel_legal,
    autorizadoRetirar: row.autorizado_retirar,
    observacoes: row.observacoes,
  };
}

export async function getContextoResponsaveis(): Promise<ContextoResponsaveis | null> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) return null;

  const supabase = await createClient();

  const [{ data: escola }, { data: turmas }] = await Promise.all([
    supabase
      .from("escolas")
      .select("nome")
      .eq("id", profile.escola_id)
      .maybeSingle(),
    supabase
      .from("turmas")
      .select("id, nome, serie")
      .eq("escola_id", profile.escola_id),
  ]);

  const turmaIds = turmas?.map((turma) => turma.id) ?? [];

  const { data: matriculas } = turmaIds.length
    ? await supabase
        .from("matriculas")
        .select("aluno_id, turma_id")
        .in("turma_id", turmaIds)
        .eq("status", "ativa")
    : { data: [] };

  const turmaPorAluno = new Map(
    matriculas?.map((matricula) => [matricula.aluno_id, matricula.turma_id]) ??
      [],
  );
  const turmaPorId = new Map(turmas?.map((turma) => [turma.id, turma]) ?? []);
  const alunoIds = [...turmaPorAluno.keys()];

  const [{ data: alunos }, { data: responsaveis }] = await Promise.all([
    alunoIds.length
      ? supabase
          .from("alunos")
          .select("id, nome, nome_mae")
          .in("id", alunoIds)
          .order("nome")
      : Promise.resolve({ data: [] }),
    alunoIds.length
      ? supabase
          .from("alunos_responsaveis")
          .select(
            "id, aluno_id, nome, parentesco, cpf, rg, telefone, telefone_alt, email, endereco, bairro, cep, local_trabalho, telefone_trabalho, responsavel_legal, autorizado_retirar, observacoes",
          )
          .in("aluno_id", alunoIds)
          .order("nome")
      : Promise.resolve({ data: [] }),
  ]);

  const porAluno = new Map<string, ResponsavelAluno[]>();

  for (const row of responsaveis ?? []) {
    const lista = porAluno.get(row.aluno_id) ?? [];
    lista.push(mapearResponsavel(row));
    porAluno.set(row.aluno_id, lista);
  }

  return {
    escolaNome: escola?.nome ?? "Unidade Escolar",
    alunos: (alunos ?? []).map((aluno) => {
      const turma = turmaPorId.get(turmaPorAluno.get(aluno.id) ?? "");

      return {
        id: aluno.id,
        nome: aluno.nome,
        turma: turma ? `${turma.nome} (${turma.serie})` : "Sem turma",
        nomeMae: aluno.nome_mae,
        responsaveis: porAluno.get(aluno.id) ?? [],
      };
    }),
  };
}
