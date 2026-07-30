import type { CorRaca } from "@/types/database";

export const CORES_RACA: Record<CorRaca, string> = {
  branca: "Branca",
  preta: "Preta",
  parda: "Parda",
  amarela: "Amarela",
  indigena: "Indígena",
  nao_declarada: "Não declarada",
};

export const BUCKET_FOTOS_ALUNOS = "alunos-fotos";

/** Tamanho máximo aceito no upload da foto 3x4. */
export const FOTO_TAMANHO_MAXIMO = 2 * 1024 * 1024;

export const FOTO_TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];

export type AlunoComplementar = {
  id: string;
  nome: string;
  turma: string;
  dataNascimento: string | null;
  corRaca: CorRaca | null;
  etniaIndigena: string | null;
  fotoUrl: string | null;
};
