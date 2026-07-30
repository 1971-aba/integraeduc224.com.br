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
        grupos={turmas.map((turma) => ({
          id: turma.id,
          titulo: turma.nome,
          subtitulo: [turma.turno, turma.atividadeNome]
            .filter(Boolean)
            .join(" • "),
        }))}
        vinculosPorGrupo={Object.fromEntries(vinculos)}
        opcoes={alunos}
        emptyTitle="Nenhuma turma cadastrada"
        emptyDescription="Cadastre uma turma antes de vincular estudantes."
        emptyActionHref={`/gestor/turmas/outras-opcoes/${tipo}/turmas`}
        emptyActionLabel="Cadastrar turma"
      />
    </>
  );
}
