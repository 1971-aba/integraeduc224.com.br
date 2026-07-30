import { DEMO_ESCOLA_ID, DEMO_SECRETARIA_ID } from "@/lib/dev-auth";
import type {
  ConfiguracaoRede,
  OcorrenciaEscolar,
  ReuniaoEscolar,
} from "@/lib/gestor-modulos-types";
import {
  DEFAULT_PERMISSOES_SGA,
  DEFAULT_POLITICA_SENHA,
} from "@/lib/gestor-modulos-types";

export const devReunioes: ReuniaoEscolar[] = [
  {
    id: "dev-reuniao-1",
    escolaId: DEMO_ESCOLA_ID,
    anoLetivoId: null,
    titulo: "Conselho de classe — 1º bimestre",
    data: "2026-04-15",
    hora: "14:00",
    local: "Sala dos professores",
    descricao: "Análise dos resultados do primeiro bimestre.",
    tipo: "conselho_classe",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "dev-reuniao-2",
    escolaId: DEMO_ESCOLA_ID,
    anoLetivoId: null,
    titulo: "Reunião de pais — 3º ano",
    data: "2026-05-20",
    hora: "19:00",
    local: "Pátio coberto",
    descricao: null,
    tipo: "reuniao_pais",
    createdAt: "2026-03-05T10:00:00Z",
  },
];

export const devOcorrencias: OcorrenciaEscolar[] = [
  {
    id: "dev-ocorrencia-1",
    escolaId: DEMO_ESCOLA_ID,
    alunoId: null,
    alunoNome: "João da Silva",
    titulo: "Advertência verbal",
    descricao: "Aluno conversando durante a aula após orientação do professor.",
    tipo: "disciplinar",
    data: "2026-07-10",
    registradoPor: null,
    createdAt: "2026-07-10T14:30:00Z",
  },
];

export const devConfiguracaoRede: ConfiguracaoRede = {
  secretariaId: DEMO_SECRETARIA_ID,
  politicaSenha: { ...DEFAULT_POLITICA_SENHA },
  permissoesSga: { ...DEFAULT_PERMISSOES_SGA },
  updatedAt: "2026-01-01T00:00:00Z",
};

export const devFolgasEscolares: import("@/lib/gestor-modulos-types").FolgaEscolar[] =
  [
    {
      id: "dev-folga-1",
      escolaId: DEMO_ESCOLA_ID,
      titulo: "Reunião pedagógica — meio período",
      dataInicio: "2026-08-15",
      dataFim: "2026-08-15",
      descricao: "Expediente até 12h para formação docente.",
      createdAt: "2026-07-01T10:00:00Z",
    },
  ];

export const devEntradasAlunos: import("@/lib/gestor-modulos-types").EntradaAluno[] =
  [];

export const devEscalaVigilantes: import("@/lib/gestor-modulos-types").EscalaVigilante[] =
  [
    {
      id: "dev-vigilante-1",
      escolaId: DEMO_ESCOLA_ID,
      data: "2026-07-21",
      turno: "manha",
      vigilanteNome: "José Pereira",
      observacao: "Portaria principal",
      createdAt: "2026-07-20T08:00:00Z",
    },
    {
      id: "dev-vigilante-2",
      escolaId: DEMO_ESCOLA_ID,
      data: "2026-07-21",
      turno: "tarde",
      vigilanteNome: "Maria Santos",
      observacao: null,
      createdAt: "2026-07-20T08:00:00Z",
    },
  ];

export const devMerendaRegistros: import("@/lib/gestor-modulos-types").MerendaRegistro[] =
  [
    {
      id: "dev-merenda-1",
      escolaId: DEMO_ESCOLA_ID,
      data: "2026-07-21",
      refeicao: "almoco",
      cardapio: "Arroz, feijão, frango grelhado e salada",
      qtdAlunos: 245,
      observacao: null,
      createdAt: "2026-07-21T12:30:00Z",
    },
  ];

export const devTarefasEscolares: import("@/lib/gestor-modulos-types").TarefaEscolar[] =
  [];

export const devAlmoxarifadoItens: import("@/lib/gestor-modulos-types").AlmoxarifadoItem[] =
  [
    {
      id: "dev-almox-1",
      escolaId: DEMO_ESCOLA_ID,
      nome: "Papel A4",
      categoria: "papelaria",
      quantidade: 120,
      unidade: "resma",
      estoqueMinimo: 20,
      createdAt: "2026-01-10T08:00:00Z",
    },
    {
      id: "dev-almox-2",
      escolaId: DEMO_ESCOLA_ID,
      nome: "Detergente neutro",
      categoria: "limpeza",
      quantidade: 8,
      unidade: "galão",
      estoqueMinimo: 5,
      createdAt: "2026-01-10T08:00:00Z",
    },
  ];

export const devEstruturaEscolar: import("@/lib/gestor-modulos-types").EstruturaEscolarItem[] =
  [
    {
      id: "dev-estrutura-1",
      escolaId: DEMO_ESCOLA_ID,
      tipo: "sala",
      nome: "Sala 01 — 1º Ano A",
      capacidade: 30,
      descricao: "Ar-condicionado, lousa digital",
      createdAt: "2026-01-05T08:00:00Z",
    },
    {
      id: "dev-estrutura-2",
      escolaId: DEMO_ESCOLA_ID,
      tipo: "biblioteca",
      nome: "Biblioteca Escolar",
      capacidade: 40,
      descricao: null,
      createdAt: "2026-01-05T08:00:00Z",
    },
  ];

