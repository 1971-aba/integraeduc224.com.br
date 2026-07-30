import { requireRole } from "@/lib/auth";
import type { DocumentoAluno } from "@/lib/documentos-aluno-config";
import { createClient } from "@/lib/supabase/server";

export type AlunoDocumento = {
  id: string;
  nome: string;
  turma: string;
  valor: string | null;
  /** Órgão emissor, usado somente pelo RG. */
  complemento: string | null;
};

export type ContextoDocumento = {
  escolaNome: string;
  pendentes: AlunoDocumento[];
  informados: AlunoDocumento[];
};

export async function getContextoDocumento(
  documento: DocumentoAluno,
): Promise<ContextoDocumento | null> {
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

  const [{ data: alunos }, { data: complementares }] = await Promise.all([
    alunoIds.length
      ? supabase
          .from("alunos")
          .select("id, nome, cpf, nis")
          .in("id", alunoIds)
          .order("nome")
      : Promise.resolve({ data: [] }),
    alunoIds.length
      ? supabase
          .from("alunos_complementares")
          .select(
            "aluno_id, rg, rg_orgao_emissor, certidao_nascimento, codigo_inep, cartao_sus",
          )
          .in("aluno_id", alunoIds)
      : Promise.resolve({ data: [] }),
  ]);

  const complementarPorAluno = new Map(
    complementares?.map((item) => [item.aluno_id, item]) ?? [],
  );

  const pendentes: AlunoDocumento[] = [];
  const informados: AlunoDocumento[] = [];

  for (const aluno of alunos ?? []) {
    const complementar = complementarPorAluno.get(aluno.id);
    const origem: Record<string, string | null | undefined> =
      documento.tabela === "alunos" ? aluno : (complementar ?? {});

    const turma = turmaPorId.get(turmaPorAluno.get(aluno.id) ?? "");

    const registro: AlunoDocumento = {
      id: aluno.id,
      nome: aluno.nome,
      turma: turma ? `${turma.nome} (${turma.serie})` : "Sem turma",
      valor: origem[documento.coluna] ?? null,
      complemento:
        documento.id === "rg" ? complementar?.rg_orgao_emissor ?? null : null,
    };

    if (registro.valor) {
      informados.push(registro);
    } else {
      pendentes.push(registro);
    }
  }

  return {
    escolaNome: escola?.nome ?? "Unidade Escolar",
    pendentes,
    informados,
  };
}
