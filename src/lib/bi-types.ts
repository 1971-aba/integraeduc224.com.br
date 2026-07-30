export const EVASAO_LIMITE_PERCENTUAL = 25;

export type AlunoEvasao = {
  matricula_id: string;
  aluno_id: string;
  aluno_nome: string;
  escola_id: string;
  escola_nome: string;
  turma_nome: string;
  serie: string;
  total_aulas: number;
  total_faltas: number;
  percentual_faltas: number;
};

export type DesempenhoItem = {
  escola_id: string;
  escola_nome: string;
  serie: string;
  disciplina_id: string;
  disciplina_nome: string;
  bimestre_numero: number;
  media: number;
  total_notas: number;
};

export type BiFilters = {
  escolaId?: string;
  serie?: string;
  disciplinaId?: string;
  bimestreId?: string;
};
