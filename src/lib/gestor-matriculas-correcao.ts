import { DEMO_ANO_LETIVO_ID } from "@/lib/dev-auth";
import type {
  AlunoSemMatricula2026,
  CorrecaoMatriculasResumo,
  MatriculaCorrecaoItem,
} from "@/lib/gestor-modulos-types";
import { createClient } from "@/lib/supabase/server";

export async function getAnoLetivoId(
  secretariaId: string,
  ano: number,
): Promise<string | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("anos_letivos")
    .select("id")
    .eq("secretaria_id", secretariaId)
    .eq("ano", ano)
    .maybeSingle();

  if (data?.id) return data.id;

  if (ano === 2026) return DEMO_ANO_LETIVO_ID;

  return null;
}

export async function getCorrecaoMatriculas2026(
  escolaId: string,
  secretariaId: string,
  options?: { turmaId?: string; busca?: string },
): Promise<CorrecaoMatriculasResumo> {
  const ano = 2026;
  const supabase = await createClient();
  const anoLetivoId = await getAnoLetivoId(secretariaId, ano);

  const empty: CorrecaoMatriculasResumo = {
    ano,
    anoLetivoId,
    totalMatriculasAtivas: 0,
    alunosSemMatricula: 0,
    matriculasDuplicadas: 0,
    matriculas: [],
    alunosSemVinculo: [],
  };

  if (!anoLetivoId) return empty;

  let turmasQuery = supabase
    .from("turmas")
    .select("id, nome, serie, turno")
    .eq("escola_id", escolaId)
    .eq("ano_letivo_id", anoLetivoId)
    .order("nome");

  if (options?.turmaId) {
    turmasQuery = turmasQuery.eq("id", options.turmaId);
  }

  const { data: turmas } = await turmasQuery;
  const turmaIds = turmas?.map((t) => t.id) ?? [];
  const turmaMap = new Map(turmas?.map((t) => [t.id, t]) ?? []);

  if (turmaIds.length === 0) return empty;

  const { data: matriculasRaw } = await supabase
    .from("matriculas")
    .select("id, aluno_id, turma_id, status, data_matricula")
    .in("turma_id", turmaIds)
    .eq("ano_letivo_id", anoLetivoId)
    .eq("status", "ativa")
    .order("data_matricula", { ascending: false });

  const alunoIds = [
    ...new Set(matriculasRaw?.map((m) => m.aluno_id) ?? []),
  ];

  const alunoCountMap = new Map<string, number>();
  for (const matricula of matriculasRaw ?? []) {
    alunoCountMap.set(
      matricula.aluno_id,
      (alunoCountMap.get(matricula.aluno_id) ?? 0) + 1,
    );
  }

  let alunosQuery = supabase
    .from("alunos")
    .select("id, nome, cpf")
    .eq("secretaria_id", secretariaId);

  if (alunoIds.length > 0) {
    alunosQuery = alunosQuery.in("id", alunoIds);
  } else {
    return empty;
  }

  const { data: alunosMatriculados } = await alunosQuery;
  const alunoMap = new Map(
    alunosMatriculados?.map((a) => [a.id, a]) ?? [],
  );

  let matriculas: MatriculaCorrecaoItem[] = (matriculasRaw ?? [])
    .map((matricula) => {
      const aluno = alunoMap.get(matricula.aluno_id);
      const turma = turmaMap.get(matricula.turma_id);
      if (!aluno || !turma) return null;

      return {
        matriculaId: matricula.id,
        alunoId: matricula.aluno_id,
        alunoNome: aluno.nome,
        turmaId: matricula.turma_id,
        turmaNome: turma.nome,
        turmaSerie: turma.serie,
        status: matricula.status,
        dataMatricula: matricula.data_matricula,
        duplicada: (alunoCountMap.get(matricula.aluno_id) ?? 0) > 1,
      };
    })
    .filter((item): item is MatriculaCorrecaoItem => item !== null);

  if (options?.busca?.trim()) {
    const termo = options.busca.trim().toLowerCase();
    matriculas = matriculas.filter((m) =>
      m.alunoNome.toLowerCase().includes(termo),
    );
  }

  matriculas.sort((a, b) =>
    a.alunoNome.localeCompare(b.alunoNome, "pt-BR"),
  );

  const matriculasDuplicadas = matriculas.filter((m) => m.duplicada).length;

  const { data: todasTurmasEscola } = await supabase
    .from("turmas")
    .select("id")
    .eq("escola_id", escolaId)
    .eq("ano_letivo_id", anoLetivoId);

  const todasTurmaIds = todasTurmasEscola?.map((t) => t.id) ?? [];

  const { data: matriculasAtivasEscola } = todasTurmaIds.length
    ? await supabase
        .from("matriculas")
        .select("aluno_id")
        .in("turma_id", todasTurmaIds)
        .eq("ano_letivo_id", anoLetivoId)
        .eq("status", "ativa")
    : { data: [] };

  const alunosComMatricula = new Set(
    matriculasAtivasEscola?.map((m) => m.aluno_id) ?? [],
  );

  let alunosSemQuery = supabase
    .from("alunos")
    .select("id, nome, cpf")
    .eq("secretaria_id", secretariaId)
    .order("nome");

  if (options?.busca?.trim()) {
    alunosSemQuery = alunosSemQuery.ilike(
      "nome",
      `%${options.busca.trim()}%`,
    );
  }

  const { data: todosAlunos } = await alunosSemQuery;

  const alunosSemVinculo: AlunoSemMatricula2026[] = (todosAlunos ?? [])
    .filter((aluno) => !alunosComMatricula.has(aluno.id))
    .map((aluno) => ({
      alunoId: aluno.id,
      alunoNome: aluno.nome,
      cpf: aluno.cpf,
    }));

  return {
    ano,
    anoLetivoId,
    totalMatriculasAtivas: matriculas.length,
    alunosSemMatricula: alunosSemVinculo.length,
    matriculasDuplicadas,
    matriculas,
    alunosSemVinculo,
  };
}
