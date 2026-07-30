import type { TipoAtividadeExtra } from "@/types/database";

export const TIPOS_ATIVIDADE_EXTRA: Record<
  TipoAtividadeExtra,
  { label: string; slug: string; descricao: string }
> = {
  complementar: {
    label: "Atividades Complementares",
    slug: "complementar",
    descricao:
      "Turmas e atividades de contraturno, reforço e projetos complementares",
  },
  aee: {
    label: "Acompanhamento do AEE",
    slug: "aee",
    descricao:
      "Atendimento Educacional Especializado: turmas, atendimentos e acompanhamento",
  },
};

export function isTipoAtividadeExtra(
  value: string,
): value is TipoAtividadeExtra {
  return value === "complementar" || value === "aee";
}

export const DIAS_SEMANA_EXTRAS = [
  { valor: 1, label: "Segunda" },
  { valor: 2, label: "Terça" },
  { valor: 3, label: "Quarta" },
  { valor: 4, label: "Quinta" },
  { valor: 5, label: "Sexta" },
] as const;

export type AtividadeExtra = {
  id: string;
  nome: string;
  descricao: string | null;
  cargaHorariaSemanal: number | null;
  turmas: number;
};

export type TurmaExtra = {
  id: string;
  nome: string;
  turno: string;
  local: string | null;
  atividadeId: string | null;
  atividadeNome: string | null;
  professorId: string | null;
  professorNome: string | null;
  alunos: number;
  disciplinas: number;
  aulas: number;
};

export type HorarioExtra = {
  id: string;
  turmaExtraId: string;
  turmaNome: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  professorNome: string | null;
  atividadeNome: string | null;
};

export type VinculoTurmaExtra = {
  id: string;
  nome: string;
};
