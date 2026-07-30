import { getProfessorAtribuicoes } from "@/lib/diario";

export type HorarioAulaSlot = {
  dia: string;
  diaIndex: number;
  horaInicio: string;
  horaFim: string;
  disciplina: string;
  turma: string;
  serie: string;
  turno: string;
  atribuicaoId: string;
};

const DIAS_SEMANA = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
] as const;

const PERIODOS_MANHA = [
  { inicio: "07:00", fim: "07:50" },
  { inicio: "07:50", fim: "08:40" },
  { inicio: "08:40", fim: "09:30" },
  { inicio: "09:50", fim: "10:40" },
  { inicio: "10:40", fim: "11:30" },
];

const PERIODOS_TARDE = [
  { inicio: "13:00", fim: "13:50" },
  { inicio: "13:50", fim: "14:40" },
  { inicio: "14:40", fim: "15:30" },
  { inicio: "15:50", fim: "16:40" },
  { inicio: "16:40", fim: "17:30" },
];

function periodosPorTurno(turno: string) {
  const t = turno.toLowerCase();
  if (t.includes("tarde") || t.includes("vespertino")) {
    return PERIODOS_TARDE;
  }
  return PERIODOS_MANHA;
}

function formatTurnoLabel(turno: string) {
  const t = turno.toLowerCase();
  if (t.includes("tarde") || t.includes("vespertino")) return "Tarde";
  if (t.includes("noite") || t.includes("noturno")) return "Noite";
  return "Manhã";
}

export async function getHorarioProfessor(
  professorId: string,
): Promise<HorarioAulaSlot[]> {
  const atribuicoes = await getProfessorAtribuicoes(professorId);
  const ativas = atribuicoes.filter((item) => item.anos_letivos?.ativo);

  const slots: HorarioAulaSlot[] = [];
  const contadoresTurno: Record<string, number> = {};

  for (const atribuicao of ativas) {
    const turno = atribuicao.turmas?.turno ?? "manha";
    const turnoKey = formatTurnoLabel(turno);
    const periodos = periodosPorTurno(turno);
    const idx = contadoresTurno[turnoKey] ?? 0;
    contadoresTurno[turnoKey] = idx + 1;

    const diaIndex = idx % DIAS_SEMANA.length;
    const periodoIndex = Math.floor(idx / DIAS_SEMANA.length) % periodos.length;
    const periodo = periodos[periodoIndex];

    slots.push({
      dia: DIAS_SEMANA[diaIndex],
      diaIndex,
      horaInicio: periodo.inicio,
      horaFim: periodo.fim,
      disciplina: atribuicao.disciplinas?.nome ?? "Disciplina",
      turma: atribuicao.turmas?.nome ?? "Turma",
      serie: atribuicao.turmas?.serie ?? "—",
      turno: turnoKey,
      atribuicaoId: atribuicao.id,
    });
  }

  return slots.sort((a, b) => {
    if (a.diaIndex !== b.diaIndex) return a.diaIndex - b.diaIndex;
    return a.horaInicio.localeCompare(b.horaInicio);
  });
}

export { DIAS_SEMANA, formatTurnoLabel };
