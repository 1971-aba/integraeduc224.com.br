import { notFound } from "next/navigation";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { VinculosExtrasPanel } from "@/components/gestor/extras/vinculos-extras-panel";
import { requireRole } from "@/lib/auth";
import {
  isTipoAtividadeExtra,
  TIPOS_ATIVIDADE_EXTRA,
} from "@/lib/extras-config";
import {
  getAlunosDisponiveis,
  getAlunosPorTurmaExtra,
  getTurmasExtras,
} from "@/lib/gestor-extras";

export default async function VincularAlunosExtraPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  if (!isTipoAtividadeExtra(tipo)) notFound();

  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const turmas = await getTurmasExtras(profile, tipo);
  const [vinculos, alunos] = await Promise.all([
    getAlunosPorTurmaExtra(turmas.map((turma) => turma.id)),
    getAlunosDisponiveis(profile),
  ]);

  return (
    <>
      <GestorPageHeader
        title="Vinculando Alunos"
        description={`${TIPOS_ATIVIDADE_EXTRA[tipo].label} — estudantes atendidos em cada turma`}
      />
      <VinculosExtrasPanel
        kind="alunos"
        turmas={turmas}
        vinculosPorTurma={Object.fromEntries(vinculos)}
        opcoes={alunos}
      />
    </>
  );
}
