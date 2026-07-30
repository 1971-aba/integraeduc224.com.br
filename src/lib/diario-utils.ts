import type { Database } from "@/types/database";

export type PresencaStatus = Database["public"]["Enums"]["presenca_status"];

export function formatDateInput(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export function calcularMediaAnual(
  medias: Array<number | null | undefined>,
) {
  const validas = medias.filter(
    (m): m is number => m !== null && m !== undefined,
  );
  if (validas.length === 0) return null;
  const soma = validas.reduce((acc, n) => acc + n, 0);
  return Math.round((soma / validas.length) * 100) / 100;
}

export function calcMediaBimestre(
  nota: number | null,
  recuperacao: number | null,
) {
  if (nota === null && recuperacao === null) return null;
  if (recuperacao === null) return nota;
  if (nota === null) return recuperacao;
  return Math.max(nota, recuperacao);
}
