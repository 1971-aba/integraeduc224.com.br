import type { ParentescoResponsavel } from "@/types/database";

export const PARENTESCOS: Record<ParentescoResponsavel, string> = {
  mae: "Mãe",
  pai: "Pai",
  avo: "Avô / Avó",
  tio: "Tio / Tia",
  irmao: "Irmão / Irmã",
  tutor: "Tutor legal",
  outro: "Outro",
};

export type ResponsavelAluno = {
  id: string;
  alunoId: string;
  nome: string;
  parentesco: ParentescoResponsavel;
  cpf: string | null;
  rg: string | null;
  telefone: string | null;
  telefoneAlt: string | null;
  email: string | null;
  endereco: string | null;
  bairro: string | null;
  cep: string | null;
  localTrabalho: string | null;
  telefoneTrabalho: string | null;
  responsavelLegal: boolean;
  autorizadoRetirar: boolean;
  observacoes: string | null;
};

export type AlunoComResponsaveis = {
  id: string;
  nome: string;
  turma: string;
  nomeMae: string | null;
  responsaveis: ResponsavelAluno[];
};

export function isParentesco(valor: string): valor is ParentescoResponsavel {
  return valor in PARENTESCOS;
}
