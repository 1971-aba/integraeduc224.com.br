import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type {
  AlunoOpcao,
  AlunoVinculado,
  ProgramaProjeto,
} from "@/lib/programas-projetos-config";
import type {
  EtapaProgramaProjeto,
  TipoProgramaProjeto,
} from "@/types/database";

export type ContextoProgramasProjetos = {
  escolaNome: string;
  itens: ProgramaProjeto[];
  alunos: AlunoOpcao[];
  vinculosPorItem: Record<string, AlunoVinculado[]>;
};

/**
 * Alunos com matrícula ativa nas turmas da escola, com o nome da turma para
 * facilitar a identificação de homônimos.
 */
async function getAlunosDaEscola(escolaId: string): Promise<AlunoOpcao[]> {
  const supabase = await createClient();

  const { data: turmas } = await supabase
    .from("turmas")
    .select("id, nome, serie")
    .eq("escola_id", escolaId);

  const turmaIds = turmas?.map((turma) => turma.id) ?? [];
  if (turmaIds.length === 0) return [];

  const { data: matriculas } = await supabase
    .from("matriculas")
    .select("aluno_id, turma_id")
    .in("turma_id", turmaIds)
    .eq("status", "ativa");

  const turmaPorAluno = new Map(
    matriculas?.map((matricula) => [matricula.aluno_id, matricula.turma_id]) ??
      [],
  );
  const turmaPorId = new Map(turmas?.map((turma) => [turma.id, turma]) ?? []);
  const alunoIds = [...turmaPorAluno.keys()];

  if (alunoIds.length === 0) return [];

  const { data: alunos } = await supabase
    .from("alunos")
    .select("id, nome")
    .in("id", alunoIds)
    .order("nome");

  return (alunos ?? []).map((aluno) => {
    const turma = turmaPorId.get(turmaPorAluno.get(aluno.id) ?? "");
    return {
      id: aluno.id,
      nome: aluno.nome,
      turma: turma ? `${turma.nome} (${turma.serie})` : "Sem turma",
    };
  });
}

export async function getContextoProgramasProjetos(
  tipo: TipoProgramaProjeto,
  etapa?: EtapaProgramaProjeto,
): Promise<ContextoProgramasProjetos | null> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) return null;

  const supabase = await createClient();

  let itensQuery = supabase
    .from("programas_projetos")
    .select("*")
    .eq("escola_id", profile.escola_id)
    .eq("tipo", tipo)
    .order("nome");

  if (etapa) {
    itensQuery = itensQuery.eq("etapa", etapa);
  }

  const [{ data: escola }, { data: itens }, alunos] = await Promise.all([
    supabase
      .from("escolas")
      .select("nome")
      .eq("id", profile.escola_id)
      .maybeSingle(),
    itensQuery,
    getAlunosDaEscola(profile.escola_id),
  ]);

  const itemIds = itens?.map((item) => item.id) ?? [];

  const { data: vinculos } = itemIds.length
    ? await supabase
        .from("programas_projetos_alunos")
        .select("id, programa_projeto_id, aluno_id")
        .in("programa_projeto_id", itemIds)
    : { data: [] };

  const alunoPorId = new Map(alunos.map((aluno) => [aluno.id, aluno]));
  const vinculosPorItem: Record<string, AlunoVinculado[]> = {};

  for (const vinculo of vinculos ?? []) {
    const aluno = alunoPorId.get(vinculo.aluno_id);
    const lista = vinculosPorItem[vinculo.programa_projeto_id] ?? [];
    lista.push({
      vinculoId: vinculo.id,
      alunoId: vinculo.aluno_id,
      // Um aluno vinculado pode ter saído da escola depois do vínculo.
      nome: aluno?.nome ?? "Aluno fora desta escola",
      turma: aluno?.turma ?? "—",
    });
    vinculosPorItem[vinculo.programa_projeto_id] = lista;
  }

  for (const lista of Object.values(vinculosPorItem)) {
    lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }

  return {
    escolaNome: escola?.nome ?? "Unidade Escolar",
    itens: (itens ?? []).map((item) => ({
      id: item.id,
      tipo: item.tipo,
      etapa: item.etapa,
      nome: item.nome,
      descricao: item.descricao,
      responsavel: item.responsavel,
      dataInicio: item.data_inicio,
      dataFim: item.data_fim,
      totalAlunos: (vinculosPorItem[item.id] ?? []).length,
    })),
    alunos,
    vinculosPorItem,
  };
}
