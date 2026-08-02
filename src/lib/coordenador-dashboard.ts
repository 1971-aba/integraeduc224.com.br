import type { SupabaseClient } from "@supabase/supabase-js";

import { formatDashboardDate, formatTurnoLabel } from "@/lib/dashboard-utils";
import { getEscolaResumo } from "@/lib/coordenador-data";
import { DEMO_ESCOLA_JOAO_BARBOSA_ID, DEMO_ESCOLA_JOAO_BARBOSA_NOME } from "@/lib/dev-auth";
import type { DashboardConfig, DashboardNotification, MenuItem } from "@/types/dashboard";
import type { Database, Profile } from "@/types/database";

const EM_BREVE_BASE = "/coordenador/em-breve";

function emBreve(modulo: string) {
  return `${EM_BREVE_BASE}?modulo=${encodeURIComponent(modulo)}`;
}

function emBreveAdmin(modulo: string) {
  return emBreve(`Administração — ${modulo}`);
}

function emBreveAlunosRede(modulo: string) {
  return emBreve(`Alunos da Rede — ${modulo}`);
}

const HISTORICO_ESCOLAR_BASE = "Históricos e Declarações — Histórico Escolar";
const ACOMPANHAR_CONFECCAO_BASE = `${HISTORICO_ESCOLAR_BASE} — Acompanhar Confecção`;
const CONFECCAO_ANO_A_ANO_BASE = `${ACOMPANHAR_CONFECCAO_BASE} — Confecção ano a ano`;

const historicosPorAnoItems: MenuItem[] = [2, 3, 4, 5, 6, 7, 8, 9].map((ano) => ({
  label: `Históricos ${ano}º ano`,
  href: emBreveAlunosRede(`${CONFECCAO_ANO_A_ANO_BASE} — Históricos ${ano}º ano`),
}));

export const coordenadorMenuItems: MenuItem[] = [
  {
    label: "Home",
    href: "/coordenador",
  },
  {
    label: "Administração",
    children: [
      {
        label: "Escolas da Rede",
        href: emBreveAdmin("Escolas da Rede"),
      },
      {
        label: "Calendário Escolar",
        href: "/coordenador/calendario",
      },
      {
        label: "Feriados e Folgas",
        href: emBreveAdmin("Feriados e Folgas"),
      },
      {
        label: "Evasão Escolar",
        href: "/coordenador/evasao",
      },
      {
        label: "Reuniões e Eventos",
        href: emBreveAdmin("Reuniões e Eventos"),
      },
      {
        label: "Estrutura e Outros",
        children: [
          {
            label: "Dados da Secretaria",
            href: emBreveAdmin("Estrutura e Outros — Dados da Secretaria"),
          },
          {
            label: "Bairros e Povoados",
            href: emBreveAdmin("Estrutura e Outros — Bairros e Povoados"),
          },
          {
            label: "Rotas de Ônibus",
            children: [
              {
                label: "Cadastro e Consultas",
                href: emBreveAdmin(
                  "Estrutura e Outros — Rotas de Ônibus — Cadastro e Consultas",
                ),
              },
            ],
          },
          {
            label: "Turmas Ativas",
            children: [
              {
                label: "Todas as Turmas",
                href: emBreveAdmin("Estrutura e Outros — Turmas Ativas — Todas as Turmas"),
              },
              {
                label: "Ens. Fund. Finais",
                href: emBreveAdmin("Estrutura e Outros — Turmas Ativas — Ens. Fund. Finais"),
              },
              {
                label: "Ens. Fund. Iniciais",
                href: emBreveAdmin("Estrutura e Outros — Turmas Ativas — Ens. Fund. Iniciais"),
              },
              {
                label: "Educação Infantil",
                href: emBreveAdmin("Estrutura e Outros — Turmas Ativas — Educação Infantil"),
              },
              {
                label: "EJA",
                href: emBreveAdmin("Estrutura e Outros — Turmas Ativas — EJA"),
              },
              {
                label: "Multisseriados",
                href: emBreveAdmin("Estrutura e Outros — Turmas Ativas — Multisseriados"),
              },
            ],
          },
          {
            label: "Atualização de Dados",
            children: [
              {
                label: "Cadastro e Consultas",
                href: emBreveAdmin(
                  "Estrutura e Outros — Atualização de Dados — Cadastro e Consultas",
                ),
              },
            ],
          },
          {
            label: "Cópia de Segurança",
            children: [
              {
                label: "Cadastro de Alunos",
                href: emBreveAdmin("Estrutura e Outros — Cópia de Segurança — Cadastro de Alunos"),
              },
              {
                label: "Escolas da Rede",
                href: emBreveAdmin("Estrutura e Outros — Cópia de Segurança — Escolas da Rede"),
              },
              {
                label: "Turmas da Rede",
                href: emBreveAdmin("Estrutura e Outros — Cópia de Segurança — Turmas da Rede"),
              },
              {
                label: "Disciplinas da Rede",
                href: emBreveAdmin("Estrutura e Outros — Cópia de Segurança — Disciplinas da Rede"),
              },
              {
                label: "Históricos Escolares",
                href: emBreveAdmin("Estrutura e Outros — Cópia de Segurança — Históricos Escolares"),
              },
              {
                label: "Notas Avaliativas",
                href: emBreveAdmin("Estrutura e Outros — Cópia de Segurança — Notas Avaliativas"),
              },
              {
                label: "Conceitos Avaliativos",
                href: emBreveAdmin("Estrutura e Outros — Cópia de Segurança — Conceitos Avaliativos"),
              },
              {
                label: "Frequência Escolar",
                href: emBreveAdmin("Estrutura e Outros — Cópia de Segurança — Frequência Escolar"),
              },
              {
                label: "Informações Locais",
                href: emBreveAdmin("Estrutura e Outros — Cópia de Segurança — Informações Locais"),
              },
              {
                label: "Cadastro de Professores",
                href: emBreveAdmin("Estrutura e Outros — Cópia de Segurança — Cadastro de Professores"),
              },
              {
                label: "Cadastro de Servidores",
                href: emBreveAdmin("Estrutura e Outros — Cópia de Segurança — Cadastro de Servidores"),
              },
            ],
          },
          {
            label: "Relatório Avaliativo",
            href: "/coordenador/relatorio-avaliativo",
          },
        ],
      },
    ],
  },
  {
    label: "Alunos da Rede",
    children: [
      {
        label: "Históricos e Declarações",
        children: [
          {
            label: "Emitir Declarações",
            href: emBreveAlunosRede("Históricos e Declarações — Emitir Declarações"),
          },
          {
            label: "Histórico Escolar",
            children: [
              {
                label: "Históricos da Rede",
                href: emBreveAlunosRede(`${HISTORICO_ESCOLAR_BASE} — Históricos da Rede`),
              },
              {
                label: "Acompanhar Confecção",
                children: [
                  {
                    label: "Confecção 6º ao 9º ano",
                    href: emBreveAlunosRede(
                      `${ACOMPANHAR_CONFECCAO_BASE} — Confecção 6º ao 9º ano`,
                    ),
                  },
                  {
                    label: "Confecção ano a ano",
                    children: historicosPorAnoItems,
                  },
                ],
              },
            ],
          },
        ],
      },
      { label: "Relação de Alunos", href: "/coordenador/alunos" },
      {
        label: "Outras Informações",
        href: emBreveAlunosRede("Outras Informações"),
      },
      { label: "Frequência Escolar", href: "/coordenador/frequencia" },
      { label: "Boletins e Fichas", href: "/coordenador/boletins" },
      {
        label: "Aluno Nota 10: 2026",
        href: emBreveAlunosRede("Aluno Nota 10: 2026"),
      },
      {
        label: "Matrícula 2026",
        href: emBreveAlunosRede("Matrícula 2026"),
      },
      {
        label: "Anos Anteriores",
        href: emBreveAlunosRede("Anos Anteriores"),
      },
    ],
  },
  {
    label: "Professores",
    children: [
      { label: "Corpo Docente", href: "/coordenador/professores" },
      { label: "Planos de Aula", href: "/coordenador/planos" },
    ],
  },
  {
    label: "Servidores",
    children: [
      {
        label: "Servidores da Escola",
        href: emBreve("Servidores — Servidores da Escola"),
      },
    ],
  },
];

export const coordenadorDefaultNotifications: DashboardNotification[] = [
  {
    id: "alert-vigias",
    type: "alert",
    message: "VIGIAS de Plantão nas Escolas Municipais HOJE",
  },
  {
    id: "stats-planos",
    type: "stats",
    message: "Planos produzidos na Rede até o momento:",
    highlight: "12.864",
    detail: "produzidos HOJE: 83",
  },
  {
    id: "info-florestas",
    type: "info",
    message:
      "Hoje é: Dia de Proteção às Florestas (Data Comemorativa Nacional)",
  },
  {
    id: "info-recesso",
    type: "info",
    message: "Hoje é: 14 a 28 de julho (RECESSO MUNICIPAL)",
  },
  {
    id: "birthday-professor",
    type: "birthday",
    message: "Aniversariante: MARIA VIEIRA LEAL",
    detail: "PROFESSOR",
  },
];

export async function getCoordenadorDashboardConfig(
  supabase: SupabaseClient<Database>,
  profile: Profile,
): Promise<DashboardConfig> {
  const escolaId = profile.escola_id;

  if (!escolaId) {
    return {
      schoolName: DEMO_ESCOLA_JOAO_BARBOSA_NOME,
      location: "Jardim do Mulato-PI",
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
    : "Jardim do Mulato-PI";

  return {
    schoolName:
      escola?.nome.toUpperCase() ??
      (escolaId === DEMO_ESCOLA_JOAO_BARBOSA_ID
        ? DEMO_ESCOLA_JOAO_BARBOSA_NOME
        : "Unidade Escolar"),
    location,
    date: formatDashboardDate(new Date()),
  };
}

export async function getCoordenadorNotifications(
  supabase: SupabaseClient<Database>,
  escolaId: string | null,
): Promise<DashboardNotification[]> {
  const notifications: DashboardNotification[] = [];

  if (!escolaId) {
    notifications.push({
      id: "info-sem-escola",
      type: "alert",
      message:
        "Seu perfil não está vinculado a uma escola. Solicite ao SGA a correção do cadastro.",
    });
    return notifications;
  }

  const [resumo, { data: turmas }] = await Promise.all([
    getEscolaResumo(supabase, escolaId),
    supabase.from("turmas").select("id, serie, turno").eq("escola_id", escolaId),
  ]);

  notifications.push({
    id: "stats-escola",
    type: "stats",
    message: "Resumo da unidade escolar:",
    highlight: `${resumo.alunosMatriculados} alunos`,
    detail: `${resumo.professores} professores • ${resumo.turmas} turmas`,
  });

  if (resumo.pendenciasHoje > 0) {
    notifications.push({
      id: "alert-pendencias",
      type: "alert",
      message: `${resumo.pendenciasHoje} pendência(s) de diário hoje na escola`,
      detail: "Acesse Conferir Diários pelo painel inicial",
    });
  }

  const turmaIds = turmas?.map((turma) => turma.id) ?? [];

  if (turmaIds.length > 0) {
    const { data: matriculas } = await supabase
      .from("matriculas")
      .select("aluno_id, turma_id")
      .in("turma_id", turmaIds)
      .eq("status", "ativa");

    const alunoIds = [
      ...new Set(matriculas?.map((matricula) => matricula.aluno_id) ?? []),
    ];

    if (alunoIds.length > 0) {
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
    }
  }

  const { count: planosTotal } = await supabase
    .from("planos_aula")
    .select("*", { count: "exact", head: true });

  const hoje = new Date().toISOString().slice(0, 10);
  const { count: planosHoje } = await supabase
    .from("planos_aula")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${hoje}T00:00:00`)
    .lte("created_at", `${hoje}T23:59:59`);

  if (planosTotal !== null) {
    notifications.push({
      id: "stats-planos",
      type: "info",
      message: "Planos produzidos na rede até o momento:",
      highlight: planosTotal.toLocaleString("pt-BR"),
      detail: `produzidos HOJE: ${planosHoje ?? 0}`,
    });
  }

  return notifications;
}
