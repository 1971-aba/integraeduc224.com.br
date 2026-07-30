import { formatTurnoLabel } from "@/lib/dashboard-utils";
import { getGestorEscolaScope } from "@/lib/gestor-relatorios";
import {
  DIAS_SEMANA,
  PERIODOS_MANHA,
  PERIODOS_TARDE,
} from "@/lib/professor-horario";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export type VinculoDocente = {
  atribuicaoId: string;
  turmaId: string;
  turmaNome: string;
  serie: string;
  turno: string;
  escolaNome: string;
  disciplinaId: string;
  disciplinaNome: string;
  professorId: string;
  professorNome: string;
};

/** Vínculos professor–disciplina–turma das escolas sob responsabilidade do perfil. */
export async function getVinculosDocentes(
  profile: Profile,
): Promise<VinculoDocente[]> {
  const supabase = await createClient();
  const scope = await getGestorEscolaScope(supabase, profile);

  if (scope.escolaIds.length === 0) return [];

  const { data: turmas } = await supabase
    .from("turmas")
    .select("id, nome, serie, turno, escola_id")
    .in("escola_id", scope.escolaIds)
    .order("serie")
    .order("nome");

  const turmaIds = turmas?.map((turma) => turma.id) ?? [];
  if (turmaIds.length === 0) return [];

  const { data: atribuicoes } = await supabase
    .from("atribuicoes_docentes")
    .select("id, professor_id, disciplina_id, turma_id")
    .in("turma_id", turmaIds);

  if (!atribuicoes?.length) return [];

  const professorIds = [
    ...new Set(atribuicoes.map((item) => item.professor_id)),
  ];
  const disciplinaIds = [
    ...new Set(atribuicoes.map((item) => item.disciplina_id)),
  ];

  const [{ data: professores }, { data: disciplinas }] = await Promise.all([
    supabase.from("profiles").select("id, nome").in("id", professorIds),
    supabase.from("disciplinas").select("id, nome").in("id", disciplinaIds),
  ]);

  const turmaMap = new Map((turmas ?? []).map((turma) => [turma.id, turma]));
  const professorMap = new Map(
    (professores ?? []).map((professor) => [professor.id, professor.nome]),
  );
  const disciplinaMap = new Map(
    (disciplinas ?? []).map((disciplina) => [disciplina.id, disciplina.nome]),
  );

  return atribuicoes
    .map((item) => {
      const turma = turmaMap.get(item.turma_id);

      return {
        atribuicaoId: item.id,
        turmaId: item.turma_id,
        turmaNome: turma?.nome ?? "Turma",
        serie: turma?.serie ?? "—",
        turno: formatTurnoLabel(turma?.turno ?? "manha"),
        escolaNome: turma?.escola_id
          ? (scope.escolaNomes[turma.escola_id] ?? "Escola")
          : "Escola",
        disciplinaId: item.disciplina_id,
        disciplinaNome: disciplinaMap.get(item.disciplina_id) ?? "Disciplina",
        professorId: item.professor_id,
        professorNome: professorMap.get(item.professor_id) ?? "Professor",
      };
    })
    .sort(
      (a, b) =>
        a.serie.localeCompare(b.serie, "pt-BR") ||
        a.turmaNome.localeCompare(b.turmaNome, "pt-BR") ||
        a.disciplinaNome.localeCompare(b.disciplinaNome, "pt-BR"),
    );
}

export type TurmaComVinculos = {
  turmaId: string;
  turmaNome: string;
  serie: string;
  turno: string;
  escolaNome: string;
  itens: Array<{
    atribuicaoId: string;
    disciplinaNome: string;
    professorNome: string;
  }>;
};

export function agruparVinculosPorTurma(
  vinculos: VinculoDocente[],
): TurmaComVinculos[] {
  const map = new Map<string, TurmaComVinculos>();

  for (const vinculo of vinculos) {
    const atual = map.get(vinculo.turmaId) ?? {
      turmaId: vinculo.turmaId,
      turmaNome: vinculo.turmaNome,
      serie: vinculo.serie,
      turno: vinculo.turno,
      escolaNome: vinculo.escolaNome,
      itens: [],
    };

    atual.itens.push({
      atribuicaoId: vinculo.atribuicaoId,
      disciplinaNome: vinculo.disciplinaNome,
      professorNome: vinculo.professorNome,
    });

    map.set(vinculo.turmaId, atual);
  }

  return [...map.values()];
}

export type ProfessorComVinculos = {
  professorId: string;
  professorNome: string;
  itens: Array<{
    atribuicaoId: string;
    turmaNome: string;
    serie: string;
    turno: string;
    disciplinaNome: string;
  }>;
};

export function agruparVinculosPorProfessor(
  vinculos: VinculoDocente[],
): ProfessorComVinculos[] {
  const map = new Map<string, ProfessorComVinculos>();

  for (const vinculo of vinculos) {
    const atual = map.get(vinculo.professorId) ?? {
      professorId: vinculo.professorId,
      professorNome: vinculo.professorNome,
      itens: [],
    };

    atual.itens.push({
      atribuicaoId: vinculo.atribuicaoId,
      turmaNome: vinculo.turmaNome,
      serie: vinculo.serie,
      turno: vinculo.turno,
      disciplinaNome: vinculo.disciplinaNome,
    });

    map.set(vinculo.professorId, atual);
  }

  return [...map.values()].sort((a, b) =>
    a.professorNome.localeCompare(b.professorNome, "pt-BR"),
  );
}

export type SlotHorarioEscolar = {
  dia: string;
  diaIndex: number;
  horaInicio: string;
  horaFim: string;
  turmaId: string;
  turmaNome: string;
  serie: string;
  turno: string;
  disciplinaNome: string;
  professorId: string;
  professorNome: string;
};

function periodosPorTurno(turno: string) {
  return turno.toLowerCase().startsWith("tarde")
    ? PERIODOS_TARDE
    : PERIODOS_MANHA;
}

/**
 * Distribui os vínculos de cada turma na grade semanal.
 * Não existe tabela de horários: a grade é derivada das atribuições docentes,
 * por turma, para que uma turma não receba duas aulas no mesmo horário.
 */
export function montarHorarioEscolar(
  vinculos: VinculoDocente[],
): SlotHorarioEscolar[] {
  const slots: SlotHorarioEscolar[] = [];
  const contadorPorTurma = new Map<string, number>();

  for (const vinculo of vinculos) {
    const idx = contadorPorTurma.get(vinculo.turmaId) ?? 0;
    contadorPorTurma.set(vinculo.turmaId, idx + 1);

    const periodos = periodosPorTurno(vinculo.turno);
    const diaIndex = idx % DIAS_SEMANA.length;
    const periodo =
      periodos[Math.floor(idx / DIAS_SEMANA.length) % periodos.length];

    slots.push({
      dia: DIAS_SEMANA[diaIndex],
      diaIndex,
      horaInicio: periodo.inicio,
      horaFim: periodo.fim,
      turmaId: vinculo.turmaId,
      turmaNome: vinculo.turmaNome,
      serie: vinculo.serie,
      turno: vinculo.turno,
      disciplinaNome: vinculo.disciplinaNome,
      professorId: vinculo.professorId,
      professorNome: vinculo.professorNome,
    });
  }

  return slots.sort(
    (a, b) =>
      a.diaIndex - b.diaIndex || a.horaInicio.localeCompare(b.horaInicio),
  );
}

export type ChoqueHorario = {
  professorId: string;
  professorNome: string;
  dia: string;
  horario: string;
  turmas: string[];
};

export type TurmaSemVinculo = {
  turmaId: string;
  turmaNome: string;
  serie: string;
  turno: string;
};

export type IrregularidadesHorario = {
  choques: ChoqueHorario[];
  turmasSemDisciplina: TurmaSemVinculo[];
  turmasSemEstudante: TurmaSemVinculo[];
};

/**
 * Aponta inconsistências na grade: um professor alocado em duas turmas no
 * mesmo horário, turmas sem disciplina vinculada e turmas sem matrículas.
 */
export function detectarIrregularidadesHorario(
  slots: SlotHorarioEscolar[],
  turmas: Array<{
    turmaId: string;
    turmaNome: string;
    serie: string;
    turno: string;
    totalAlunos: number;
  }>,
  vinculos: VinculoDocente[],
): IrregularidadesHorario {
  const porProfessorHorario = new Map<
    string,
    { professorNome: string; dia: string; horario: string; turmas: Set<string> }
  >();

  for (const slot of slots) {
    const horario = `${slot.horaInicio} às ${slot.horaFim}`;
    const chave = `${slot.professorId}|${slot.diaIndex}|${slot.horaInicio}`;

    const atual = porProfessorHorario.get(chave) ?? {
      professorNome: slot.professorNome,
      dia: slot.dia,
      horario,
      turmas: new Set<string>(),
    };

    atual.turmas.add(`${slot.turmaNome} — ${slot.serie}`);
    porProfessorHorario.set(chave, atual);
  }

  const choques: ChoqueHorario[] = [];

  for (const [chave, valor] of porProfessorHorario) {
    if (valor.turmas.size < 2) continue;

    choques.push({
      professorId: chave.split("|")[0],
      professorNome: valor.professorNome,
      dia: valor.dia,
      horario: valor.horario,
      turmas: [...valor.turmas].sort((a, b) => a.localeCompare(b, "pt-BR")),
    });
  }

  const turmasComVinculo = new Set(vinculos.map((vinculo) => vinculo.turmaId));

  const resumir = (turma: (typeof turmas)[number]): TurmaSemVinculo => ({
    turmaId: turma.turmaId,
    turmaNome: turma.turmaNome,
    serie: turma.serie,
    turno: turma.turno,
  });

  return {
    choques,
    turmasSemDisciplina: turmas
      .filter((turma) => !turmasComVinculo.has(turma.turmaId))
      .map(resumir),
    turmasSemEstudante: turmas
      .filter((turma) => turma.totalAlunos === 0)
      .map(resumir),
  };
}

export type RotinaDia = {
  dia: string;
  diaIndex: number;
  aulas: number;
  turmas: number;
  professores: number;
};

export type CargaSemanal = {
  id: string;
  nome: string;
  aulas: number;
};

export type RotinasSemanais = {
  porDia: RotinaDia[];
  porTurma: CargaSemanal[];
  porProfessor: CargaSemanal[];
  totalAulas: number;
};

export function resumoRotinasSemanais(
  slots: SlotHorarioEscolar[],
): RotinasSemanais {
  const porDia = DIAS_SEMANA.map((dia, diaIndex) => {
    const doDia = slots.filter((slot) => slot.diaIndex === diaIndex);

    return {
      dia,
      diaIndex,
      aulas: doDia.length,
      turmas: new Set(doDia.map((slot) => slot.turmaId)).size,
      professores: new Set(doDia.map((slot) => slot.professorId)).size,
    };
  });

  const acumular = (
    chave: (slot: SlotHorarioEscolar) => { id: string; nome: string },
  ): CargaSemanal[] => {
    const map = new Map<string, CargaSemanal>();

    for (const slot of slots) {
      const { id, nome } = chave(slot);
      const atual = map.get(id) ?? { id, nome, aulas: 0 };
      atual.aulas += 1;
      map.set(id, atual);
    }

    return [...map.values()].sort(
      (a, b) => b.aulas - a.aulas || a.nome.localeCompare(b.nome, "pt-BR"),
    );
  };

  return {
    porDia,
    porTurma: acumular((slot) => ({
      id: slot.turmaId,
      nome: `${slot.turmaNome} — ${slot.serie}`,
    })),
    porProfessor: acumular((slot) => ({
      id: slot.professorId,
      nome: slot.professorNome,
    })),
    totalAulas: slots.length,
  };
}

export type OpcoesAtribuicao = {
  professores: Array<{ id: string; label: string }>;
  disciplinas: Array<{ id: string; label: string }>;
  turmas: Array<{ id: string; label: string }>;
  anoLetivoId: string | null;
};

/** Opções para o formulário de vínculo, restritas ao escopo do perfil. */
export async function getOpcoesAtribuicao(
  profile: Profile,
): Promise<OpcoesAtribuicao> {
  const supabase = await createClient();
  const scope = await getGestorEscolaScope(supabase, profile);

  if (scope.escolaIds.length === 0) {
    return { professores: [], disciplinas: [], turmas: [], anoLetivoId: null };
  }

  const professoresQuery = supabase
    .from("profiles")
    .select("id, nome")
    .eq("role", "professor")
    .eq("ativo", true)
    .order("nome");

  if (profile.role === "gestor_escolar" && profile.escola_id) {
    professoresQuery.eq("escola_id", profile.escola_id);
  } else if (profile.secretaria_id) {
    professoresQuery.eq("secretaria_id", profile.secretaria_id);
  }

  const [{ data: professores }, { data: disciplinas }, { data: turmas }, { data: anoAtivo }] =
    await Promise.all([
      professoresQuery,
      supabase.from("disciplinas").select("id, nome").order("nome"),
      supabase
        .from("turmas")
        .select("id, nome, serie, turno")
        .in("escola_id", scope.escolaIds)
        .order("serie")
        .order("nome"),
      supabase
        .from("anos_letivos")
        .select("id")
        .eq("ativo", true)
        .maybeSingle(),
    ]);

  return {
    professores: (professores ?? []).map((professor) => ({
      id: professor.id,
      label: professor.nome,
    })),
    disciplinas: (disciplinas ?? []).map((disciplina) => ({
      id: disciplina.id,
      label: disciplina.nome,
    })),
    turmas: (turmas ?? []).map((turma) => ({
      id: turma.id,
      label: `${turma.nome} — ${turma.serie} (${formatTurnoLabel(turma.turno)})`,
    })),
    anoLetivoId: anoAtivo?.id ?? null,
  };
}
