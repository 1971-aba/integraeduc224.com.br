import type {
  EtapaProgramaProjeto,
  TipoProgramaProjeto,
} from "@/types/database";

/**
 * O slug da URL é plural ("projetos"), enquanto o banco guarda o tipo no
 * singular ("projeto").
 */
export const SLUGS_TIPO: Record<string, TipoProgramaProjeto> = {
  projetos: "projeto",
  programas: "programa",
};

export const TIPOS_PROGRAMA_PROJETO: Record<
  TipoProgramaProjeto,
  { slug: string; singular: string; plural: string }
> = {
  projeto: { slug: "projetos", singular: "Projeto", plural: "Projetos" },
  programa: { slug: "programas", singular: "Programa", plural: "Programas" },
};

export const ETAPAS_PROGRAMA_PROJETO: Record<
  EtapaProgramaProjeto,
  { label: string; descricao: string }
> = {
  fundamental: {
    label: "Ensino Fundamental",
    descricao: "Anos iniciais e finais do Ensino Fundamental",
  },
  infantil: {
    label: "Educação Infantil",
    descricao: "Creche e pré-escola",
  },
};

export function resolverTipo(slug: string): TipoProgramaProjeto | null {
  return SLUGS_TIPO[slug] ?? null;
}

export type ProgramaProjeto = {
  id: string;
  tipo: TipoProgramaProjeto;
  etapa: EtapaProgramaProjeto;
  nome: string;
  descricao: string | null;
  responsavel: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  totalAlunos: number;
};

export type AlunoVinculado = {
  vinculoId: string;
  alunoId: string;
  nome: string;
  turma: string;
};

export type AlunoOpcao = {
  id: string;
  nome: string;
  turma: string;
};
