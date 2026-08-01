import type { SupabaseClient } from "@supabase/supabase-js";

import { formatDashboardDate, formatTurnoLabel } from "@/lib/dashboard-utils";
import {
  DOCUMENTOS_ALUNO,
  DOCUMENTOS_ALUNO_IDS,
} from "@/lib/documentos-aluno-config";
import { DEMO_ESCOLA_ID, DEMO_ESCOLA_NOME } from "@/lib/dev-auth";
import type { DashboardConfig, DashboardNotification, MenuItem } from "@/types/dashboard";
import type { Database, Profile } from "@/types/database";

const EM_BREVE_BASE = "/gestor/em-breve";

function emBreve(modulo: string) {
  return `${EM_BREVE_BASE}?modulo=${encodeURIComponent(modulo)}`;
}

/** Atividades Complementares e AEE compartilham as mesmas seis telas. */
function menuAtividadesExtras(tipo: "complementar" | "aee"): MenuItem[] {
  const base = `/gestor/turmas/outras-opcoes/${tipo}`;

  return [
    { label: "Cadastro de Turmas", href: `${base}/turmas` },
    { label: "Cadastro de Atividades", href: `${base}/atividades` },
    {
      label: "Vincular ao Professor",
      children: [
        { label: "Atividades", href: `${base}/professor/atividades` },
        { label: "Turmas", href: `${base}/professor/turmas` },
      ],
    },
    { label: "Vinculando Alunos", href: `${base}/alunos` },
    { label: "Vincular Disciplinas", href: `${base}/disciplinas` },
    { label: "Horário Complementar", href: `${base}/horario` },
  ];
}

/** Projetos e Programas usam as mesmas quatro telas, mudando apenas o tipo. */
function menuProgramasProjetos(tipo: "projetos" | "programas"): MenuItem[] {
  const base = `/gestor/alunos/outras-opcoes/programas-projetos/${tipo}`;
  const rotulo = tipo === "projetos" ? "Projetos" : "Programas";

  return [
    { label: `${rotulo} Fundamental`, href: `${base}/fundamental` },
    { label: `${rotulo} Infantil`, href: `${base}/infantil` },
    { label: "Vincular Alunos", href: `${base}/vincular` },
    { label: "Consultar Aluno", href: `${base}/consultar` },
  ];
}

/** Meses disponíveis em Consultar Faltosos (servidor). */
function menuFaltososServidor2026(): MenuItem[] {
  return [3, 4, 5, 6, 7].map((mes) => ({
    label: `Gerar: ${mes}/2026`,
    href: `/gestor/frequencia-mensal/servidor/faltosos/2026/${mes}`,
  }));
}

/** Meses disponíveis em Consultar Faltosos (professor). */
function menuFaltososProfessor2026(): MenuItem[] {
  return [3, 4, 5, 6, 7].map((mes) => ({
    label: `Gerar: ${mes}/2026`,
    href: `/gestor/frequencia-mensal/professor/faltosos/2026/${mes}`,
  }));
}

export const gestorMenuItems: MenuItem[] = [
  {
    label: "Home",
    href: "/gestor",
  },
  {
    label: "Cadastros",
    children: [
      {
        label: "Turmas e Disciplinas",
        children: [
          {
            label: "Turmas",
            children: [
              { label: "Cadastro de Turmas", href: "/gestor/turmas" },
              {
                label: "Vincular Disciplinas",
                href: "/gestor/turmas/disciplinas",
              },
              {
                label: "Vincular Professores",
                children: [
                  {
                    label: "Por Turma",
                    href: "/gestor/turmas/professores/turma",
                  },
                  {
                    label: "Por Professor",
                    href: "/gestor/turmas/professores/professor",
                  },
                ],
              },
              {
                label: "Formação de Turma",
                href: "/gestor/turmas/formacao",
              },
              {
                label: "Horário Escolar",
                children: [
                  {
                    label: "Horário por Turma",
                    href: "/gestor/turmas/horario/turma",
                  },
                  {
                    label: "Consultar Horário",
                    href: "/gestor/turmas/horario/consultar",
                  },
                  {
                    label: "Horário Irregular",
                    href: "/gestor/turmas/horario/irregular",
                  },
                  {
                    label: "Rotinas Semanais",
                    href: "/gestor/turmas/horario/rotinas",
                  },
                ],
              },
              {
                label: "Outras Opções",
                children: [
                  {
                    label: "Atividades Complementares",
                    children: menuAtividadesExtras("complementar"),
                  },
                  {
                    label: "Acompanhamento do AEE",
                    children: menuAtividadesExtras("aee"),
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        label: "Cadastro de Alunos",
        children: [
          { label: "Alunos Rede Municipal", href: "/gestor/alunos" },
          { label: "Alunos da Escola", href: "/gestor/alunos/escola" },
          {
            label: "Informações Médicas",
            children: [
              { label: "Preencher Ficha", href: "/gestor/alunos/ficha-medica" },
              {
                label: "Ficha em Branco",
                href: "/gestor/alunos/ficha-medica/branco",
              },
            ],
          },
          { label: "Imprimir Carteirinhas", href: "/gestor/alunos/carteirinhas" },
          {
            label: "Outras Opções",
            children: [
              {
                label: "Vincular Aluno Externo",
                children: [
                  {
                    label: "Vincular para Matrícula",
                    href: "/gestor/alunos/outras-opcoes/vincular/matricula",
                  },
                  {
                    label: "Receber Transferências",
                    href: "/gestor/alunos/outras-opcoes/vincular/transferencias",
                  },
                  {
                    label: "Resgatar Evasão Escolar",
                    href: "/gestor/alunos/outras-opcoes/vincular/evasao",
                  },
                ],
              },
              {
                label: "Dados Complementares",
                children: [
                  {
                    label: "Informar Cor / Raça / Etnia",
                    href: "/gestor/alunos/outras-opcoes/complementares/cor-raca",
                  },
                  {
                    label: "Incluir Fotografia do Aluno",
                    href: "/gestor/alunos/outras-opcoes/complementares/fotografia",
                  },
                  {
                    label: "Alunos Novos da Escola",
                    href: "/gestor/alunos/outras-opcoes/complementares/novos",
                  },
                  {
                    label: "Casos de Idade Incompatível",
                    href: "/gestor/alunos/outras-opcoes/complementares/idade-serie",
                  },
                  {
                    label: "Documentação Pendente",
                    children: DOCUMENTOS_ALUNO_IDS.map((id) => ({
                      label: DOCUMENTOS_ALUNO[id].titulo,
                      href: `/gestor/alunos/outras-opcoes/documentacao/${id}`,
                    })),
                  },
                  {
                    label: "Cadastro de Responsáveis",
                    children: [
                      {
                        label: "Cadastro de Responsáveis",
                        href: "/gestor/alunos/outras-opcoes/complementares/responsaveis",
                      },
                      {
                        label: "Ficha em Branco",
                        href: "/gestor/alunos/outras-opcoes/complementares/responsaveis/branco",
                      },
                    ],
                  },
                ],
              },
              {
                label: "Formulário de Matrícula",
                href: "/gestor/alunos/outras-opcoes/formulario-matricula",
              },
              {
                label: "Alunos Ensino Médio",
                href: "/gestor/alunos/outras-opcoes/ensino-medio",
              },
              {
                label: "Pais de Aluno da Escola",
                href: "/gestor/alunos/outras-opcoes/pais",
              },
              {
                label: "Cadastrar Ex-aluno",
                href: "/gestor/alunos/outras-opcoes/ex-aluno",
              },
              {
                label: "Programas e Projetos",
                children: [
                  {
                    label: "Projetos",
                    children: menuProgramasProjetos("projetos"),
                  },
                  {
                    label: "Programas",
                    children: menuProgramasProjetos("programas"),
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        label: "Cadastro de Professores",
        children: [
          {
            label: "Professores da Escola",
            href: "/gestor/professores/escola",
          },
          {
            label: "Vinculando Disciplinas",
            href: "/gestor/professores/disciplinas",
          },
          {
            label: "Cursos e Especializações",
            href: "/gestor/professores/cursos",
          },
          {
            label: "Formulário de Matrícula",
            href: "/gestor/professores/formulario-matricula",
          },
        ],
      },
      {
        label: "Cadastro de Servidores",
        children: [
          {
            label: "Servidores da Escola",
            href: "/gestor/servidores/escola",
          },
        ],
      },
      { label: "Calendário Escolar", href: "/gestor/calendario" },
      { label: "Reuniões e Eventos", href: "/gestor/reunioes" },
      {
        label: "Estrutura e Outros",
        children: [
          {
            label: "Informações da Escola",
            href: "/gestor/estrutura/informacoes",
          },
          {
            label: "Salas de Dependências",
            children: [
              {
                label: "Cadastro e Consultas",
                href: "/gestor/estrutura/salas/cadastro",
              },
              {
                label: "Vincular nova Série",
                href: "/gestor/estrutura/salas/relacao",
              },
            ],
          },
          {
            label: "Bairros e Povoados",
            href: "/gestor/estrutura/bairros",
          },
          {
            label: "Rotas de Ônibus",
            children: [
              {
                label: "Cadastro e Consultas",
                href: "/gestor/estrutura/rotas/cadastro",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "Administração",
    children: [
      { label: "Entrada de Alunos", href: "/gestor/entrada-alunos" },
      {
        label: "Ocorrências",
        children: [
          {
            label: "Alunos e Outros",
            href: "/gestor/ocorrencias/alunos",
          },
          {
            label: "Estrutura e Outros",
            children: [
              {
                label: "Informar",
                href: "/gestor/ocorrencias/estrutura/informar",
              },
              {
                label: "Atendidas",
                href: "/gestor/ocorrencias/estrutura/atendidas",
              },
            ],
          },
        ],
      },
      { label: "Feriados e Folgas", href: "/gestor/feriados" },
      { label: "Escala de Vigilantes", href: "/gestor/vigilantes" },
      {
        label: "Controle de Almoxarifado",
        children: [
          {
            label: "Estoque da Rede",
            href: "/gestor/almoxarifado/rede",
          },
          {
            label: "Estoque da Escola",
            href: "/gestor/almoxarifado/escola",
          },
          {
            label: "Doação para Alunos",
            href: "/gestor/almoxarifado/doacao",
          },
        ],
      },
      {
        label: "Controle de Merenda",
        children: [
          {
            label: "Estoque da Escola",
            href: "/gestor/merenda/estoque",
          },
          {
            label: "Cardápios da Escola",
            href: "/gestor/merenda/cardapios",
          },
        ],
      },
      {
        label: "Frequência Mensal 2026",
        children: [
          {
            label: "Frequência Professor",
            children: [
              {
                label: "Lançar Falta Dia",
                href: "/gestor/frequencia-mensal/professor/lancar",
              },
              {
                label: "Consultar Faltosos",
                children: menuFaltososProfessor2026(),
              },
            ],
          },
          {
            label: "Frequência Servidor",
            children: [
              {
                label: "Lançamento de Faltas",
                href: "/gestor/frequencia-mensal/servidor/lancar",
              },
              {
                label: "Consultar Faltosos",
                children: menuFaltososServidor2026(),
              },
            ],
          },
        ],
      },
      { label: "Corrigir Matrículas 2026", href: "/gestor/corrigir-matriculas" },
    ],
  },
  {
    label: "Consultas",
    children: [
      {
        label: "Sala de Aula",
        children: [
          {
            label: "Frequência Aluno",
            children: [
              {
                label: "Frequência Aluno",
                href: "/gestor/consultas/sala-de-aula/frequencia-aluno/aluno",
              },
              {
                label: "Frequência Anual",
                href: "/gestor/consultas/sala-de-aula/frequencia-aluno/anual",
              },
            ],
          },
          {
            label: "Frequência Turma",
            href: "/gestor/consultas/sala-de-aula/frequencia-turma",
          },
          {
            label: "Avaliações Gerais",
            href: "/gestor/consultas/sala-de-aula/avaliacoes-gerais",
          },
          {
            label: "Anos Anteriores",
            href: "/gestor/consultas/sala-de-aula/anos-anteriores",
          },
          {
            label: "Atualizar Dados",
            href: "/gestor/consultas/sala-de-aula/atualizar-dados",
          },
        ],
      },
      {
        label: "Aluno nota 10",
        children: [
          {
            label: "Ranking por Turma",
            href: "/gestor/consultas/aluno-nota-10/ranking-por-turma",
          },
        ],
      },
      { label: "Visão Geral", href: "/gestor/relatorios" },
      { label: "Conferir Diários", href: "/gestor/consultas/diario" },
      { label: "Frequência Escolar", href: "/gestor/consultas/frequencia" },
      { label: "Evasão Escolar", href: "/gestor/consultas/evasao" },
      {
        label: "Matrículas 2026",
        children: [
          {
            label: "Matrículas 2026 Geral",
            href: "/gestor/consultas/matriculas-2026/geral",
          },
          {
            label: "Matrículas 2026 Turno",
            href: "/gestor/consultas/matriculas-2026/turno",
          },
        ],
      },
    ],
  },
  {
    label: "Documentos",
    children: [
      { label: "Visão Geral", href: "/gestor/documentos" },
      { label: "Declaração de Matrícula", href: "/gestor/documentos/declaracao" },
      { label: "Histórico Escolar", href: "/gestor/documentos/historico" },
      { label: "Autorizações", href: "/gestor/documentos/autorizacao" },
    ],
  },
  {
    label: "Relatórios",
    children: [
      { label: "Resumo de Matrículas", href: "/gestor/relatorios/matriculas" },
      { label: "Alunos por Turma", href: "/gestor/relatorios/por-turma" },
      { label: "Alunos por Série", href: "/gestor/relatorios/por-serie" },
      { label: "Todos os Alunos", href: "/gestor/alunos" },
    ],
  },
];

export async function getGestorDashboardConfig(
  supabase: SupabaseClient<Database>,
  profile: Profile,
): Promise<DashboardConfig> {
  const escolaId = profile.escola_id;

  if (!escolaId) {
    return {
      schoolName: profile.nome.toUpperCase(),
      location: "Município não informado",
      date: formatDashboardDate(new Date()),
    };
  }

  const { data: escola } = await supabase
    .from("escolas")
    .select("nome, secretaria_id")
    .eq("id", escolaId)
    .single();

  const { data: secretaria } = escola?.secretaria_id
    ? await supabase
        .from("secretarias")
        .select("municipio, uf")
        .eq("id", escola.secretaria_id)
        .single()
    : { data: null };

  const location = secretaria
    ? `${secretaria.municipio}-${secretaria.uf}`
    : escolaId === DEMO_ESCOLA_ID
      ? "Jardim do Mulato-PI"
      : "Município não informado";

  return {
    schoolName: escola?.nome.toUpperCase() ?? 
      (escolaId === DEMO_ESCOLA_ID ? DEMO_ESCOLA_NOME : "Unidade Escolar"),
    location,
    date: formatDashboardDate(new Date()),
  };
}

export async function getGestorNotifications(
  supabase: SupabaseClient<Database>,
  escolaId: string | null,
): Promise<DashboardNotification[]> {
  const notifications: DashboardNotification[] = [
    {
      id: "info-calendario",
      type: "info",
      message:
        "Consulte o calendário escolar em Cadastros → Calendário Escolar.",
    },
  ];

  if (!escolaId) {
    return notifications;
  }

  const { data: turmas } = await supabase
    .from("turmas")
    .select("id, serie, turno")
    .eq("escola_id", escolaId);

  const turmaIds = turmas?.map((turma) => turma.id) ?? [];

  if (turmaIds.length === 0) {
    return notifications;
  }

  const { data: matriculas } = await supabase
    .from("matriculas")
    .select("aluno_id, turma_id")
    .in("turma_id", turmaIds)
    .eq("status", "ativa");

  const alunoIds = [
    ...new Set(matriculas?.map((matricula) => matricula.aluno_id) ?? []),
  ];

  if (alunoIds.length === 0) {
    return notifications;
  }

  const { data: alunos } = await supabase
    .from("alunos")
    .select("id, nome, data_nascimento")
    .in("id", alunoIds);

  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  const turmaMap = new Map(turmas?.map((turma) => [turma.id, turma]) ?? []);
  const matriculaPorAluno = new Map(
    matriculas?.map((matricula) => [matricula.aluno_id, matricula]) ?? [],
  );

  for (const aluno of alunos ?? []) {
    if (!aluno.data_nascimento) continue;

    const birthDate = new Date(`${aluno.data_nascimento}T12:00:00`);
    if (
      birthDate.getMonth() !== todayMonth ||
      birthDate.getDate() !== todayDay
    ) {
      continue;
    }

    const matricula = matriculaPorAluno.get(aluno.id);
    const turma = matricula ? turmaMap.get(matricula.turma_id) : undefined;

    notifications.push({
      id: `birthday-${aluno.id}`,
      type: "birthday",
      message: `Aniversariante: ${aluno.nome.toUpperCase()}`,
      detail: turma
        ? `${turma.serie.toUpperCase()} ${formatTurnoLabel(turma.turno)}`
        : undefined,
    });
  }

  return notifications;
}
