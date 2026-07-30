import { formatTurnoLabel } from "@/lib/dashboard-utils";
import { getGestorEscolaScope } from "@/lib/gestor-relatorios";
import { createClient } from "@/lib/supabase/server";
import type { Profile, TipoAtividadeExtra } from "@/types/database";
import type {
  AtividadeExtra,
  HorarioExtra,
  TurmaExtra,
  VinculoTurmaExtra,
} from "@/lib/extras-config";

export async function getAtividadesExtras(
  profile: Profile,
  tipo: TipoAtividadeExtra,
): Promise<AtividadeExtra[]> {
  const supabase = await createClient();
  const scope = await getGestorEscolaScope(supabase, profile);

  if (scope.escolaIds.length === 0) return [];

  const [{ data: atividades }, { data: turmas }] = await Promise.all([
    supabase
      .from("atividades_extras")
      .select("id, nome, descricao, carga_horaria_semanal")
      .eq("tipo", tipo)
      .in("escola_id", scope.escolaIds)
      .order("nome"),
    supabase
      .from("turmas_extras")
      .select("id, atividade_id")
      .eq("tipo", tipo)
      .in("escola_id", scope.escolaIds),
  ]);

  return (atividades ?? []).map((atividade) => ({
    id: atividade.id,
    nome: atividade.nome,
    descricao: atividade.descricao,
    cargaHorariaSemanal: atividade.carga_horaria_semanal,
    turmas: (turmas ?? []).filter((turma) => turma.atividade_id === atividade.id)
      .length,
  }));
}

export async function getTurmasExtras(
  profile: Profile,
  tipo: TipoAtividadeExtra,
): Promise<TurmaExtra[]> {
  const supabase = await createClient();
  const scope = await getGestorEscolaScope(supabase, profile);

  if (scope.escolaIds.length === 0) return [];

  const { data: turmas } = await supabase
    .from("turmas_extras")
    .select("id, nome, turno, local, atividade_id, professor_id")
    .eq("tipo", tipo)
    .in("escola_id", scope.escolaIds)
    .order("nome");

  if (!turmas?.length) return [];

  const turmaIds = turmas.map((turma) => turma.id);
  const atividadeIds = turmas
    .map((turma) => turma.atividade_id)
    .filter((id): id is string => Boolean(id));
  const professorIds = turmas
    .map((turma) => turma.professor_id)
    .filter((id): id is string => Boolean(id));

  const [
    { data: atividades },
    { data: professores },
    { data: alunos },
    { data: disciplinas },
    { data: horarios },
  ] = await Promise.all([
    atividadeIds.length
      ? supabase
          .from("atividades_extras")
          .select("id, nome")
          .in("id", atividadeIds)
      : Promise.resolve({ data: [] }),
    professorIds.length
      ? supabase.from("profiles").select("id, nome").in("id", professorIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from("turmas_extras_alunos")
      .select("turma_extra_id")
      .in("turma_extra_id", turmaIds),
    supabase
      .from("turmas_extras_disciplinas")
      .select("turma_extra_id")
      .in("turma_extra_id", turmaIds),
    supabase
      .from("horarios_extras")
      .select("turma_extra_id")
      .in("turma_extra_id", turmaIds),
  ]);

  const atividadeMap = new Map(
    (atividades ?? []).map((item) => [item.id, item.nome]),
  );
  const professorMap = new Map(
    (professores ?? []).map((item) => [item.id, item.nome]),
  );

  const contar = (
    lista: Array<{ turma_extra_id: string }> | null,
    turmaId: string,
  ) => (lista ?? []).filter((item) => item.turma_extra_id === turmaId).length;

  return turmas.map((turma) => ({
    id: turma.id,
    nome: turma.nome,
    turno: formatTurnoLabel(turma.turno),
    local: turma.local,
    atividadeId: turma.atividade_id,
    atividadeNome: turma.atividade_id
      ? (atividadeMap.get(turma.atividade_id) ?? null)
      : null,
    professorId: turma.professor_id,
    professorNome: turma.professor_id
      ? (professorMap.get(turma.professor_id) ?? null)
      : null,
    alunos: contar(alunos, turma.id),
    disciplinas: contar(disciplinas, turma.id),
    aulas: contar(horarios, turma.id),
  }));
}

export async function getHorariosExtras(
  profile: Profile,
  tipo: TipoAtividadeExtra,
): Promise<HorarioExtra[]> {
  const supabase = await createClient();
  const turmas = await getTurmasExtras(profile, tipo);

  if (turmas.length === 0) return [];

  const { data: horarios } = await supabase
    .from("horarios_extras")
    .select("id, turma_extra_id, dia_semana, hora_inicio, hora_fim")
    .in(
      "turma_extra_id",
      turmas.map((turma) => turma.id),
    )
    .order("dia_semana")
    .order("hora_inicio");

  const turmaMap = new Map(turmas.map((turma) => [turma.id, turma]));

  return (horarios ?? []).map((horario) => {
    const turma = turmaMap.get(horario.turma_extra_id);

    return {
      id: horario.id,
      turmaExtraId: horario.turma_extra_id,
      turmaNome: turma?.nome ?? "Turma",
      diaSemana: horario.dia_semana,
      horaInicio: horario.hora_inicio.slice(0, 5),
      horaFim: horario.hora_fim.slice(0, 5),
      professorNome: turma?.professorNome ?? null,
      atividadeNome: turma?.atividadeNome ?? null,
    };
  });
}

/** Alunos vinculados a cada turma extra, para a tela de enturmação. */
export async function getAlunosPorTurmaExtra(
  turmaIds: string[],
): Promise<Map<string, VinculoTurmaExtra[]>> {
  const resultado = new Map<string, VinculoTurmaExtra[]>();
  if (turmaIds.length === 0) return resultado;

  const supabase = await createClient();

  const { data: vinculos } = await supabase
    .from("turmas_extras_alunos")
    .select("turma_extra_id, aluno_id")
    .in("turma_extra_id", turmaIds);

  const alunoIds = [...new Set((vinculos ?? []).map((item) => item.aluno_id))];

  const { data: alunos } = alunoIds.length
    ? await supabase.from("alunos").select("id, nome").in("id", alunoIds)
    : { data: [] };

  const alunoMap = new Map((alunos ?? []).map((item) => [item.id, item.nome]));

  for (const vinculo of vinculos ?? []) {
    const atual = resultado.get(vinculo.turma_extra_id) ?? [];
    atual.push({
      id: vinculo.aluno_id,
      nome: alunoMap.get(vinculo.aluno_id) ?? "Estudante",
    });
    resultado.set(vinculo.turma_extra_id, atual);
  }

  for (const [turmaId, lista] of resultado) {
    resultado.set(
      turmaId,
      lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    );
  }

  return resultado;
}

export async function getDisciplinasPorTurmaExtra(
  turmaIds: string[],
): Promise<Map<string, VinculoTurmaExtra[]>> {
  const resultado = new Map<string, VinculoTurmaExtra[]>();
  if (turmaIds.length === 0) return resultado;

  const supabase = await createClient();

  const { data: vinculos } = await supabase
    .from("turmas_extras_disciplinas")
    .select("turma_extra_id, disciplina_id")
    .in("turma_extra_id", turmaIds);

  const disciplinaIds = [
    ...new Set((vinculos ?? []).map((item) => item.disciplina_id)),
  ];

  const { data: disciplinas } = disciplinaIds.length
    ? await supabase.from("disciplinas").select("id, nome").in("id", disciplinaIds)
    : { data: [] };

  const disciplinaMap = new Map(
    (disciplinas ?? []).map((item) => [item.id, item.nome]),
  );

  for (const vinculo of vinculos ?? []) {
    const atual = resultado.get(vinculo.turma_extra_id) ?? [];
    atual.push({
      id: vinculo.disciplina_id,
      nome: disciplinaMap.get(vinculo.disciplina_id) ?? "Disciplina",
    });
    resultado.set(vinculo.turma_extra_id, atual);
  }

  for (const [turmaId, lista] of resultado) {
    resultado.set(
      turmaId,
      lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    );
  }

  return resultado;
}

export async function getProfessoresPorAtividade(
  atividadeIds: string[],
): Promise<Map<string, VinculoTurmaExtra[]>> {
  const resultado = new Map<string, VinculoTurmaExtra[]>();
  if (atividadeIds.length === 0) return resultado;

  const supabase = await createClient();

  const { data: vinculos } = await supabase
    .from("atividades_extras_professores")
    .select("atividade_id, professor_id")
    .in("atividade_id", atividadeIds);

  const professorIds = [
    ...new Set((vinculos ?? []).map((item) => item.professor_id)),
  ];

  const { data: professores } = professorIds.length
    ? await supabase.from("profiles").select("id, nome").in("id", professorIds)
    : { data: [] };

  const professorMap = new Map(
    (professores ?? []).map((item) => [item.id, item.nome]),
  );

  for (const vinculo of vinculos ?? []) {
    const atual = resultado.get(vinculo.atividade_id) ?? [];
    atual.push({
      id: vinculo.professor_id,
      nome: professorMap.get(vinculo.professor_id) ?? "Professor",
    });
    resultado.set(vinculo.atividade_id, atual);
  }

  for (const [atividadeId, lista] of resultado) {
    resultado.set(
      atividadeId,
      lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    );
  }

  return resultado;
}

/** Estudantes com matrícula ativa nas escolas do perfil. */
export async function getAlunosDisponiveis(
  profile: Profile,
): Promise<VinculoTurmaExtra[]> {
  const supabase = await createClient();
  const scope = await getGestorEscolaScope(supabase, profile);

  if (scope.escolaIds.length === 0) return [];

  const { data: turmas } = await supabase
    .from("turmas")
    .select("id")
    .in("escola_id", scope.escolaIds);

  const turmaIds = turmas?.map((turma) => turma.id) ?? [];
  if (turmaIds.length === 0) return [];

  const { data: matriculas } = await supabase
    .from("matriculas")
    .select("aluno_id")
    .in("turma_id", turmaIds)
    .eq("status", "ativa");

  const alunoIds = [...new Set((matriculas ?? []).map((item) => item.aluno_id))];
  if (alunoIds.length === 0) return [];

  const { data: alunos } = await supabase
    .from("alunos")
    .select("id, nome")
    .in("id", alunoIds)
    .order("nome");

  return (alunos ?? []).map((aluno) => ({ id: aluno.id, nome: aluno.nome }));
}

export async function getProfessoresDisponiveis(
  profile: Profile,
): Promise<VinculoTurmaExtra[]> {
  const supabase = await createClient();

  const query = supabase
    .from("profiles")
    .select("id, nome")
    .eq("role", "professor")
    .eq("ativo", true)
    .order("nome");

  if (profile.role === "gestor_escolar" && profile.escola_id) {
    query.eq("escola_id", profile.escola_id);
  } else if (profile.secretaria_id) {
    query.eq("secretaria_id", profile.secretaria_id);
  }

  const { data } = await query;
  return (data ?? []).map((item) => ({ id: item.id, nome: item.nome }));
}

export async function getDisciplinasDisponiveis(): Promise<
  VinculoTurmaExtra[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("disciplinas")
    .select("id, nome")
    .order("nome");

  return (data ?? []).map((item) => ({ id: item.id, nome: item.nome }));
}
