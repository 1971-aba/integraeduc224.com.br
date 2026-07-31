export type ReuniaoTipo =
  | "reuniao_pais"
  | "reuniao_pedagogica"
  | "conselho_classe"
  | "formacao"
  | "outro";

export type OcorrenciaTipo =
  | "disciplinar"
  | "pedagogica"
  | "saude"
  | "administrativa"
  | "outro";

export type OcorrenciaCategoria = "alunos" | "estrutura";

export type ReuniaoEscolar = {
  id: string;
  escolaId: string;
  anoLetivoId: string | null;
  titulo: string;
  data: string;
  hora: string | null;
  local: string | null;
  descricao: string | null;
  tipo: ReuniaoTipo;
  createdAt: string;
};

export type OcorrenciaEscolar = {
  id: string;
  escolaId: string;
  alunoId: string | null;
  alunoNome: string | null;
  titulo: string;
  descricao: string;
  tipo: OcorrenciaTipo;
  categoria: OcorrenciaCategoria;
  data: string;
  registradoPor: string | null;
  createdAt: string;
};

export type PoliticaSenha = {
  minLength: number;
  exigeMaiuscula: boolean;
  exigeNumero: boolean;
  exigeEspecial: boolean;
};

export type PermissoesSga = {
  podeCriarGestor: boolean;
  podeCriarAdmin: boolean;
  podeDesativarUsuario: boolean;
  exigeEmailInstitucional: boolean;
};

export type ConfiguracaoRede = {
  secretariaId: string;
  politicaSenha: PoliticaSenha;
  permissoesSga: PermissoesSga;
  updatedAt: string | null;
};

export const REUNIAO_TIPO_LABEL: Record<ReuniaoTipo, string> = {
  reuniao_pais: "Reunião de pais",
  reuniao_pedagogica: "Reunião pedagógica",
  conselho_classe: "Conselho de classe",
  formacao: "Formação / capacitação",
  outro: "Outro",
};

export const OCORRENCIA_TIPO_LABEL: Record<OcorrenciaTipo, string> = {
  disciplinar: "Disciplinar",
  pedagogica: "Pedagógica",
  saude: "Saúde / enfermaria",
  administrativa: "Administrativa",
  outro: "Outro",
};

export const OCORRENCIA_ESTRUTURA_TIPO_LABEL: Partial<
  Record<OcorrenciaTipo, string>
> = {
  administrativa: "Administrativa",
  outro: "Outro",
};

export const DEFAULT_POLITICA_SENHA: PoliticaSenha = {
  minLength: 8,
  exigeMaiuscula: true,
  exigeNumero: true,
  exigeEspecial: false,
};

export const DEFAULT_PERMISSOES_SGA: PermissoesSga = {
  podeCriarGestor: true,
  podeCriarAdmin: false,
  podeDesativarUsuario: true,
  exigeEmailInstitucional: true,
};

export type FolgaEscolar = {
  id: string;
  escolaId: string;
  titulo: string;
  dataInicio: string;
  dataFim: string;
  descricao: string | null;
  createdAt: string;
};

export type EntradaAluno = {
  id: string;
  escolaId: string;
  matriculaId: string;
  alunoNome: string;
  turmaNome: string;
  turmaSerie: string;
  data: string;
  hora: string;
};

export const FOLGA_TIPO_LABEL: Record<string, string> = {
  feriado: "Feriado",
  recesso: "Recesso",
  folga: "Folga",
};

export type TurnoVigilancia = "manha" | "tarde" | "noite" | "integral";

export type EscalaVigilante = {
  id: string;
  escolaId: string;
  data: string;
  turno: TurnoVigilancia;
  vigilanteNome: string;
  observacao: string | null;
  createdAt: string;
};

export type RefeicaoMerenda = "cafe" | "lanche" | "almoco";

export type MerendaRegistro = {
  id: string;
  escolaId: string;
  data: string;
  refeicao: RefeicaoMerenda;
  cardapio: string;
  qtdAlunos: number;
  observacao: string | null;
  createdAt: string;
};

export type TarefaEscolar = {
  id: string;
  atribuicaoId: string;
  titulo: string;
  descricao: string;
  dataEntrega: string;
  disciplina: string;
  turma: string;
  serie: string;
  createdAt: string;
};

export const TURNO_VIGILANCIA_LABEL: Record<TurnoVigilancia, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
  integral: "Integral",
};

export const REFEICAO_MERENDA_LABEL: Record<RefeicaoMerenda, string> = {
  cafe: "Café da manhã",
  lanche: "Lanche",
  almoco: "Almoço",
};

export type AlmoxarifadoItem = {
  id: string;
  escolaId: string;
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  estoqueMinimo: number;
  createdAt: string;
};

export type EstruturaEscolarItem = {
  id: string;
  escolaId: string;
  tipo: EstruturaTipo;
  nome: string;
  capacidade: number | null;
  descricao: string | null;
  createdAt: string;
};

export type EstruturaTipo =
  | "sala"
  | "laboratorio"
  | "biblioteca"
  | "patio"
  | "administrativo"
  | "outro";

export type FrequenciaMensalTurma = {
  turmaId: string;
  turmaNome: string;
  serie: string;
  totalAlunos: number;
  totalAulas: number;
  totalPresentes: number;
  percentualPresenca: number;
};

export type FrequenciaMensalEscola = {
  ano: number;
  mes: number;
  mesLabel: string;
  turmas: FrequenciaMensalTurma[];
  totais: {
    alunos: number;
    aulas: number;
    presentes: number;
    percentual: number;
  };
};

export const ESTRUTURA_TIPO_LABEL: Record<EstruturaTipo, string> = {
  sala: "Sala de aula",
  laboratorio: "Laboratório",
  biblioteca: "Biblioteca",
  patio: "Pátio / área externa",
  administrativo: "Administrativo",
  outro: "Outro",
};

export const ALMOXARIFADO_CATEGORIAS = [
  "geral",
  "limpeza",
  "papelaria",
  "informatica",
  "merenda",
  "pedagogico",
] as const;

export const ALMOXARIFADO_CATEGORIA_LABEL: Record<string, string> = {
  geral: "Geral",
  limpeza: "Limpeza",
  papelaria: "Papelaria",
  informatica: "Informática",
  merenda: "Merenda",
  pedagogico: "Pedagógico",
};

export type MatriculaCorrecaoItem = {
  matriculaId: string;
  alunoId: string;
  alunoNome: string;
  turmaId: string;
  turmaNome: string;
  turmaSerie: string;
  status: string;
  dataMatricula: string;
  duplicada: boolean;
};

export type AlunoSemMatricula2026 = {
  alunoId: string;
  alunoNome: string;
  cpf: string | null;
};

export type CorrecaoMatriculasResumo = {
  ano: number;
  anoLetivoId: string | null;
  totalMatriculasAtivas: number;
  alunosSemMatricula: number;
  matriculasDuplicadas: number;
  matriculas: MatriculaCorrecaoItem[];
  alunosSemVinculo: AlunoSemMatricula2026[];
};

export function validarSenhaContraPolitica(
  senha: string,
  politica: PoliticaSenha,
): string | null {
  if (senha.length < politica.minLength) {
    return `A senha deve ter no mínimo ${politica.minLength} caracteres.`;
  }
  if (politica.exigeMaiuscula && !/[A-Z]/.test(senha)) {
    return "A senha deve conter ao menos uma letra maiúscula.";
  }
  if (politica.exigeNumero && !/\d/.test(senha)) {
    return "A senha deve conter ao menos um número.";
  }
  if (politica.exigeEspecial && !/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
    return "A senha deve conter ao menos um caractere especial.";
  }
  return null;
}
