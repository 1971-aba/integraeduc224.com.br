import type { TipoFormacaoProfessor } from "@/types/database";

export const TIPOS_FORMACAO: Record<TipoFormacaoProfessor, string> = {
  graduacao: "Graduação",
  especializacao: "Especialização",
  mestrado: "Mestrado",
  doutorado: "Doutorado",
  pos_doutorado: "Pós-doutorado",
  outro: "Outro curso",
};

export type FormacaoProfessor = {
  id: string;
  professorId: string;
  titulo: string;
  instituicao: string | null;
  tipo: TipoFormacaoProfessor;
  cargaHoraria: number | null;
  anoConclusao: number | null;
};

export type ProfessorEscola = {
  id: string;
  nome: string;
  email: string;
  cpf: string | null;
  ativo: boolean;
  vinculos: number;
  formacoes: number;
};

export function isTipoFormacao(valor: string): valor is TipoFormacaoProfessor {
  return valor in TIPOS_FORMACAO;
}
