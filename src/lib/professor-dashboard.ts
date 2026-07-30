import type { SupabaseClient } from "@supabase/supabase-js";



import { formatDashboardDate } from "@/lib/dashboard-utils";

import { DEMO_ESCOLA_ID, DEMO_ESCOLA_NOME } from "@/lib/dev-auth";

import { getProfessorAtribuicoes } from "@/lib/diario";

import {

  countPendenciasDiario,

  getBimestreEncerradoAlert,

} from "@/lib/professor-diario";

import type { DashboardConfig, DashboardNotification, MenuItem } from "@/types/dashboard";

import type { Database, Profile } from "@/types/database";



const EM_BREVE_BASE = "/professor/em-breve";



function emBreve(modulo: string) {

  return `${EM_BREVE_BASE}?modulo=${encodeURIComponent(modulo)}`;

}



function submenuPlaceholder(label: string): MenuItem[] {

  return [{ label, href: emBreve(label) }];

}



export const professorMenuItems: MenuItem[] = [
  {
    label: "Home",
    href: "/professor",
  },
  {
    label: "Sala de Aula",
    children: [
      {
        label: "Diário Eletrônico",
        children: [
          {
            label: "Informar Frequências",
            children: [
              {
                label: "Frequência Turma",
                href: "/professor/frequencia/turma",
              },
              {
                label: "Corrigir Frequência",
                href: "/professor/frequencia/corrigir",
              },
              {
                label: "Ativ. Complementar",
                href: "/professor/frequencia/atividade-complementar",
              },
              {
                label: "Acompanhamento AEE",
                href: "/professor/frequencia/aee",
              },
            ],
          },
          {
            label: "Pendências do Diário",
            href: "/professor/diario/pendencias",
          },
          {
            label: "Conteúdo Ministrado",
            href: "/professor/conteudo",
          },
        ],
      },
      { label: "Turmas e Disciplinas", href: "/professor/turmas" },
      { label: "Turmas e Alunos", href: "/professor/alunos" },
      { label: "Horário Escolar", href: "/professor/horario-escolar" },
      {
        label: "Frequência Escolar",
        children: [
          {
            label: "Frequência Consolidada",
            href: "/professor/consultas/frequencia",
          },
          {
            label: "Percentual Atingido",
            href: "/professor/consultas/frequencia?tipo=lte",
          },
        ],
      },
      {
        label: "Boletins e Fichas",
        children: [
          { label: "Boletim da Turma", href: "/professor/boletins" },
          { label: "Ficha Individual", href: "/professor/boletins/ficha" },
        ],
      },
      { label: "Aluno nota 10", href: "/professor/alunos-nota-10" },
      {
        label: "Plano de Aula",
        children: [
          { label: "Meus Planos", href: "/professor/planos" },
          { label: "Gerar Plano com IA", href: "/professor/planos/novo" },
        ],
      },
      {
        label: "Calendário Escolar",
        href: "/professor/calendario",
      },
      {
        label: "Feriados e Datas",
        href: "/professor/calendario",
      },
    ],
  },
  {
    label: "Avaliações e Trabalhos",
    children: [
      {
        label: "Aplicar Avaliações",
        children: [
          { label: "Registro de Notas", href: "/professor/turmas" },
          {
            label: "Desempenho da Turma",
            href: "/professor/desempenho",
          },
          {
            label: "Relatórios Individuais",
            href: "/professor/relatorios",
          },
        ],
      },
      { label: "Tarefas e Trabalhos", href: "/professor/tarefas" },
    ],
  },
];



export const professorDefaultNotifications: DashboardNotification[] = [

  {

    id: "alert-diario",

    type: "alert",

    message:

      "Diário eletrônico: registre a chamada e o conteúdo ministrado HOJE",

  },

  {

    id: "stats-planos",

    type: "stats",

    message: "Planos de aula produzidos por você:",

    highlight: "0",

    detail: "produzidos HOJE: 0",

  },

  {

    id: "info-turmas",

    type: "info",

    message: "Turmas vinculadas neste ano letivo: aguardando atribuição",

  },

  {

    id: "info-recesso",

    type: "info",

    message: "Hoje é: 14 a 28 de julho (RECESSO MUNICIPAL)",

  },

  {

    id: "info-florestas",

    type: "info",

    message:

      "Hoje é: Dia de Proteção às Florestas (Data Comemorativa Nacional)",

  },

  {

    id: "alert-ia",

    type: "alert",

    message:

      "Assistente IA: gere planos alinhados à BNCC e exporte PDF timbrado",

  },

];



export async function getProfessorDashboardConfig(

  supabase: SupabaseClient<Database>,

  profile: Profile,

): Promise<DashboardConfig> {

  const escolaId = profile.escola_id;



  if (!escolaId) {

    return {

      schoolName: profile.nome.toUpperCase(),

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

      (escolaId === DEMO_ESCOLA_ID ? DEMO_ESCOLA_NOME : "Unidade Escolar"),

    location,

    date: formatDashboardDate(new Date()),

  };

}



export async function getProfessorNotifications(

  supabase: SupabaseClient<Database>,

  professorId: string,

): Promise<DashboardNotification[]> {

  const notifications = [...professorDefaultNotifications];

  const atribuicoes = await getProfessorAtribuicoes(professorId);

  const turmasAtivas = atribuicoes.filter((item) => item.anos_letivos?.ativo);



  const bimestreAlert = await getBimestreEncerradoAlert(professorId);

  if (bimestreAlert) {

    notifications.unshift({

      id: bimestreAlert.id,

      type: "alert",

      message: bimestreAlert.message,

    });

  }



  const turmasIndex = notifications.findIndex((item) => item.id === "info-turmas");

  if (turmasIndex >= 0) {

    notifications[turmasIndex] = {

      ...notifications[turmasIndex],

      message:

        turmasAtivas.length > 0

          ? `Turmas vinculadas neste ano letivo: ${turmasAtivas.length} disciplina(s) ativa(s)`

          : "Turmas vinculadas: aguardando atribuição pela coordenação",

    };

  }



  const hoje = new Date().toISOString().slice(0, 10);



  const { count: planosTotal } = await supabase

    .from("planos_aula")

    .select("*", { count: "exact", head: true })

    .eq("professor_id", professorId);



  const { count: planosHoje } = await supabase

    .from("planos_aula")

    .select("*", { count: "exact", head: true })

    .eq("professor_id", professorId)

    .gte("created_at", `${hoje}T00:00:00`)

    .lte("created_at", `${hoje}T23:59:59`);



  const statsIndex = notifications.findIndex((item) => item.id === "stats-planos");

  if (statsIndex >= 0) {

    notifications[statsIndex] = {

      ...notifications[statsIndex],

      highlight: (planosTotal ?? 0).toLocaleString("pt-BR"),

      detail: `produzidos HOJE: ${planosHoje ?? 0}`,

    };

  }



  if (turmasAtivas.length > 0) {

    const pendentes = await countPendenciasDiario(professorId);



    const diarioIndex = notifications.findIndex((item) => item.id === "alert-diario");

    if (diarioIndex >= 0) {

      notifications[diarioIndex] = {

        ...notifications[diarioIndex],

        message:

          pendentes > 0

            ? `Diário eletrônico: ${pendentes} turma(s) com pendências HOJE`

            : "Diário eletrônico: todas as turmas em dia HOJE",

      };

    }

  }



  return notifications;

}



export type ProfessorTurmaResumo = {

  id: string;

  disciplina: string;

  turma: string;

  serie: string;

  turno: string;

  anoLetivo: number | null;

};



export function mapProfessorTurmas(

  atribuicoes: Awaited<ReturnType<typeof getProfessorAtribuicoes>>,

): ProfessorTurmaResumo[] {

  return atribuicoes.map((item) => ({

    id: item.id,

    disciplina: item.disciplinas?.nome ?? "Disciplina",

    turma: item.turmas?.nome ?? "Turma",

    serie: item.turmas?.serie ?? "—",

    turno: item.turmas?.turno ?? "—",

    anoLetivo: item.anos_letivos?.ano ?? null,

  }));

}


