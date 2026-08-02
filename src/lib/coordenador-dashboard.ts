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

export const coordenadorMenuItems: MenuItem[] = [
  {
    label: "Home",
    href: "/coordenador",
  },
  {
    label: "Administração",
    children: [
      { label: "Conferir Diários", href: "/coordenador/diario" },
      { label: "Frequência Escolar", href: "/coordenador/frequencia" },
      { label: "Evasão Escolar", href: "/coordenador/evasao" },
      {
        label: "Relatório Avaliativo",
        href: "/coordenador/relatorio-avaliativo",
      },
    ],
  },
  {
    label: "Alunos da Rede",
    children: [
      { label: "Relação de Alunos", href: "/coordenador/alunos" },
      { label: "Boletins e Fichas", href: "/coordenador/boletins" },
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
      detail: "Consulte Administração → Conferir Diários",
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
