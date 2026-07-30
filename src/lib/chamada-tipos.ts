export type ChamadaTipo = "regular" | "complementar" | "aee";

export const CHAMADA_TIPOS: Record<
  ChamadaTipo,
  { label: string; descricao: string }
> = {
  regular: {
    label: "Frequência Turma",
    descricao: "Chamada diária da turma na disciplina",
  },
  complementar: {
    label: "Atividade Complementar",
    descricao: "Registro de frequência em atividades complementares",
  },
  aee: {
    label: "Acompanhamento AEE",
    descricao: "Atendimento Educacional Especializado — frequência e registro",
  },
};

export function isChamadaTipo(value: string): value is ChamadaTipo {
  return value === "regular" || value === "complementar" || value === "aee";
}
