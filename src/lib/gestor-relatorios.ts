import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { formatTurnoLabel } from "@/lib/dashboard-utils";
import type { Database, Profile } from "@/types/database";

export type GestorEscolaScope = {
  escolaIds: string[];
  escolaNomes: Record<string, string>;
};

export type AlunoRelatorioItem = {
  nome: string;
  cpf: string | null;
};

export type TurmaRelatorio = {
  turmaId: string;
  turmaNome: string;
  serie: string;
  turno: string;
  escolaId: string;
  escolaNome: string;
  totalAlunos: number;
  alunos: AlunoRelatorioItem[];
};

export type SerieRelatorio = {
  serie: string;
  totalAlunos: number;
  turmas: number;
};

export type ResumoMatriculas = {
  totalMatriculados: number;
  totalTurmas: number;
  porTurma: Array<{
    turmaNome: string;
    serie: string;
    turno: string;
    escolaNome: string;
    total: number;
  }>;
  porSerie: SerieRelatorio[];
};

export async function getGestorEscolaScope(
  supabase: SupabaseClient<Database>,
  profile: Profile,
): Promise<GestorEscolaScope> {
  if (profile.role === "gestor_escolar" && profile.escola_id) {
    const { data: escola } = await supabase
      .from("escolas")
      .select("id, nome")
      .eq("id", profile.escola_id)
      .maybeSingle();

    return {
      escolaIds: [profile.escola_id],
      escolaNomes: escola ? { [escola.id]: escola.nome } : {},
    };
  }

  if (profile.secretaria_id) {
    const { data: escolas } = await supabase
      .from("escolas")
      .select("id, nome")
      .eq("secretaria_id", profile.secretaria_id)
      .eq("ativa", true)
      .order("nome");

    return {
      escolaIds: escolas?.map((escola) => escola.id) ?? [],
      escolaNomes: Object.fromEntries(
        (escolas ?? []).map((escola) => [escola.id, escola.nome]),
      ),
    };
  }

  return { escolaIds: [], escolaNomes: {} };
}

async function fetchMatriculasAtivasPorTurmas(
  supabase: SupabaseClient<Database>,
  turmaIds: string[],
) {
  if (turmaIds.length === 0) {
    return {
      turmas: [] as Array<{
        id: string;
        nome: string;
        serie: string;
        turno: string;
        escola_id: string;
      }>,
      matriculas: [] as Array<{ aluno_id: string; turma_id: string }>,
      alunos: [] as Array<{ id: string; nome: string; cpf: string | null }>,
    };
  }

  const [{ data: turmas }, { data: matriculas }] = await Promise.all([
    supabase
      .from("turmas")
      .select("id, nome, serie, turno, escola_id")
      .in("id", turmaIds)
      .order("serie")
      .order("nome"),
    supabase
      .from("matriculas")
      .select("aluno_id, turma_id")
      .in("turma_id", turmaIds)
      .eq("status", "ativa"),
  ]);

  const alunoIds = [
    ...new Set(matriculas?.map((matricula) => matricula.aluno_id) ?? []),
  ];

  const { data: alunos } = alunoIds.length
    ? await supabase
        .from("alunos")
        .select("id, nome, cpf")
        .in("id", alunoIds)
        .order("nome")
    : { data: [] };

  return {
    turmas: turmas ?? [],
    matriculas: matriculas ?? [],
    alunos: alunos ?? [],
  };
}

export async function getRelatorioPorTurma(
  profile: Profile,
): Promise<TurmaRelatorio[]> {
  const supabase = await createClient();
  const scope = await getGestorEscolaScope(supabase, profile);

  if (scope.escolaIds.length === 0) return [];

  const { data: turmasDb } = await supabase
    .from("turmas")
    .select("id")
    .in("escola_id", scope.escolaIds);

  const turmaIds = turmasDb?.map((turma) => turma.id) ?? [];
  const { turmas, matriculas, alunos } = await fetchMatriculasAtivasPorTurmas(
    supabase,
    turmaIds,
  );

  const alunoMap = new Map(alunos.map((aluno) => [aluno.id, aluno]));

  return turmas.map((turma) => {
    const matriculasTurma =
      matriculas?.filter((matricula) => matricula.turma_id === turma.id) ?? [];

    const alunosTurma = matriculasTurma
      .map((matricula) => alunoMap.get(matricula.aluno_id))
      .filter(Boolean)
      .map((aluno) => ({
        nome: aluno!.nome,
        cpf: aluno!.cpf,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    return {
      turmaId: turma.id,
      turmaNome: turma.nome,
      serie: turma.serie,
      turno: formatTurnoLabel(turma.turno),
      escolaId: turma.escola_id,
      escolaNome: scope.escolaNomes[turma.escola_id] ?? "Escola",
      totalAlunos: alunosTurma.length,
      alunos: alunosTurma,
    };
  });
}

export async function getRelatorioPorSerie(
  profile: Profile,
): Promise<SerieRelatorio[]> {
  const porTurma = await getRelatorioPorTurma(profile);
  const map = new Map<string, { totalAlunos: number; turmas: Set<string> }>();

  for (const turma of porTurma) {
    const atual = map.get(turma.serie) ?? {
      totalAlunos: 0,
      turmas: new Set<string>(),
    };
    atual.totalAlunos += turma.totalAlunos;
    atual.turmas.add(turma.turmaId);
    map.set(turma.serie, atual);
  }

  return Array.from(map.entries())
    .map(([serie, stats]) => ({
      serie,
      totalAlunos: stats.totalAlunos,
      turmas: stats.turmas.size,
    }))
    .sort((a, b) => a.serie.localeCompare(b.serie, "pt-BR"));
}

export async function getResumoMatriculas(
  profile: Profile,
): Promise<ResumoMatriculas> {
  const porTurma = await getRelatorioPorTurma(profile);
  const porSerie = await getRelatorioPorSerie(profile);

  return {
    totalMatriculados: porTurma.reduce(
      (sum, turma) => sum + turma.totalAlunos,
      0,
    ),
    totalTurmas: porTurma.length,
    porTurma: porTurma.map((turma) => ({
      turmaNome: turma.turmaNome,
      serie: turma.serie,
      turno: turma.turno,
      escolaNome: turma.escolaNome,
      total: turma.totalAlunos,
    })),
    porSerie,
  };
}

export function getGestorEscolaId(profile: Profile) {
  return profile.escola_id;
}
