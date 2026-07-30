import { notFound } from "next/navigation";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { VinculosExtrasPanel } from "@/components/gestor/extras/vinculos-extras-panel";
import { requireRole } from "@/lib/auth";
import {
  isTipoAtividadeExtra,
  TIPOS_ATIVIDADE_EXTRA,
} from "@/lib/extras-config";
import {
  getDisciplinasDisponiveis,
  getDisciplinasPorTurmaExtra,
  getTurmasExtras,
} from "@/lib/gestor-extras";

export default async function VincularDisciplinasExtraPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  if (!isTipoAtividadeExtra(tipo)) notFound();

  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const turmas = await getTurmasExtras(profile, tipo);
  const [vinculos, disciplinas] = await Promise.all([
    getDisciplinasPorTurmaExtra(turmas.map((turma) => turma.id)),
    getDisciplinasDisponiveis(),
  ]);

  return (
    <>
      <GestorPageHeader
        title="Vincular Disciplinas"
        description={`${TIPOS_ATIVIDADE_EXTRA[tipo].label} — áreas de conhecimento atendidas`}
      />
      <VinculosExtrasPanel
        kind="disciplinas"
        grupos={turmas.map((turma) => ({
          id: turma.id,
          titulo: turma.nome,
          subtitulo: [turma.turno, turma.atividadeNome]
            .filter(Boolean)
            .join(" • "),
        }))}
        vinculosPorGrupo={Object.fromEntries(vinculos)}
        opcoes={disciplinas}
        emptyTitle="Nenhuma turma cadastrada"
        emptyDescription="Cadastre uma turma antes de vincular disciplinas."
      />
    </>
  );
}
