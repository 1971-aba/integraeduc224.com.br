import { SERIES_ESCOLARES } from "@/lib/ai/config";

export const SERIES_ENSINO_MEDIO = SERIES_ESCOLARES.filter((serie) =>
  serie.includes("Ensino Médio"),
);

export function isSerieEnsinoMedio(serie: string) {
  return serie.includes("Ensino Médio");
}

export const MOTIVOS_SAIDA_EX_ALUNO = {
  concluido: "Concluiu os estudos",
  transferido: "Transferiu-se",
  cancelado: "Abandonou / evadiu",
} as const;

export type MotivoSaidaExAluno = keyof typeof MOTIVOS_SAIDA_EX_ALUNO;

export function isMotivoSaidaExAluno(
  valor: string,
): valor is MotivoSaidaExAluno {
  return valor in MOTIVOS_SAIDA_EX_ALUNO;
}
