import { notFound, redirect } from "next/navigation";

const MODULOS: Record<
  string,
  { tipo: "rota"; href: string } | { tipo: "em-breve"; label: string }
> = {
  "formacao-de-turma": {
    tipo: "rota",
    href: "/gestor/turmas/formacao",
  },
  "alunos-matriculados": {
    tipo: "rota",
    href: "/gestor/alunos/escola",
  },
  "horario-das-aulas": {
    tipo: "rota",
    href: "/gestor/turmas/horario/consultar",
  },
  "conteudos-das-aulas": {
    tipo: "em-breve",
    label: "Conteúdos das Aulas",
  },
  "notas-avaliativas": {
    tipo: "em-breve",
    label: "Notas Avaliativas",
  },
  "acessos-dos-alunos": {
    tipo: "em-breve",
    label: "Acessos dos Alunos",
  },
  "antecipa-certificado": {
    tipo: "em-breve",
    label: "Antecipa Certificado",
  },
};

export default async function GestorSalaDeAulaAtualizarDadosModuloPage({
  params,
}: {
  params: Promise<{ modulo: string }>;
}) {
  const { modulo } = await params;
  const config = MODULOS[modulo];

  if (!config) {
    notFound();
  }

  if (config.tipo === "rota") {
    redirect(config.href);
  }

  redirect(
    `/gestor/em-breve?modulo=${encodeURIComponent(`Atualizar Dados — ${config.label}`)}`,
  );
}
