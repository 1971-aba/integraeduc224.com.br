import type { SupabaseClient } from "@supabase/supabase-js";

import { formatDashboardDate, formatTurnoLabel } from "@/lib/dashboard-utils";
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
        ],
      },
      { label: "Cadastro de Professores", href: "/gestor/atribuicoes" },
      { label: "Cadastro de Servidores", href: "/gestor/servidores" },
      { label: "Calendário Escolar", href: "/gestor/calendario" },
      { label: "Reuniões e Eventos", href: "/gestor/reunioes" },
      { label: "Estrutura e Outros", href: "/gestor/estrutura" },
    ],
  },
  {
    label: "Administração",
    children: [
      { label: "Entrada de Alunos", href: "/gestor/entrada-alunos" },
      { label: "Ocorrências", href: "/gestor/ocorrencias" },
      { label: "Feriados e Folgas", href: "/gestor/feriados" },
      { label: "Escala de Vigilantes", href: "/gestor/vigilantes" },
      { label: "Controle de Almoxarifado", href: "/gestor/almoxarifado" },
      { label: "Controle de Merenda", href: "/gestor/merenda" },
      { label: "Frequência Mensal 2026", href: "/gestor/frequencia-mensal" },
      { label: "Corrigir Matrículas 2026", href: "/gestor/corrigir-matriculas" },
    ],
  },
  {
    label: "Consultas",
    children: [
      { label: "Visão Geral", href: "/gestor/relatorios" },
      { label: "Conferir Diários", href: "/gestor/consultas/diario" },
      { label: "Frequência Escolar", href: "/gestor/consultas/frequencia" },
      { label: "Evasão Escolar", href: "/gestor/consultas/evasao" },
      { label: "Matrículas", href: "/gestor/alunos" },
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
