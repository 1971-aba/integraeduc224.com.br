/**
 * Distorção idade-série segundo o critério do INEP: o aluno deve completar
 * 6 anos no 1º ano do Ensino Fundamental, e há distorção quando a idade
 * ultrapassa em 2 anos ou mais a esperada para a série.
 */
const IDADE_NO_PRIMEIRO_ANO = 6;

export const DEFASAGEM_MINIMA = 2;

/** Extrai o número da série a partir de textos como "5º ano" ou "3ª etapa". */
export function extrairAnoSerie(serie: string): number | null {
  const encontrado = serie.match(/(\d+)/);
  if (!encontrado) return null;

  const numero = Number(encontrado[1]);
  return numero >= 1 && numero <= 9 ? numero : null;
}

export function idadeEsperada(serie: string): number | null {
  const numero = extrairAnoSerie(serie);
  return numero === null ? null : numero + IDADE_NO_PRIMEIRO_ANO - 1;
}

/** Idade que o aluno completa ao longo do ano letivo. */
export function idadeNoAnoLetivo(
  dataNascimento: string,
  anoLetivo: number,
): number {
  return anoLetivo - new Date(`${dataNascimento}T12:00:00`).getFullYear();
}

export type SituacaoIdade = "defasagem" | "adiantado" | "adequada";

export function classificarIdade(
  idade: number,
  esperada: number,
): SituacaoIdade {
  const diferenca = idade - esperada;

  if (diferenca >= DEFASAGEM_MINIMA) return "defasagem";
  if (diferenca <= -1) return "adiantado";
  return "adequada";
}
