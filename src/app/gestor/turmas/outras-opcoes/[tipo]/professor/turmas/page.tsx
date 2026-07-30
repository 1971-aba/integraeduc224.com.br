import { notFound } from "next/navigation";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { ProfessorExtraPanel } from "@/components/gestor/extras/professor-extra-panel";
import { requireRole } from "@/lib/auth";
import {
  isTipoAtividadeExtra,
  TIPOS_ATIVIDADE_EXTRA,
} from "@/lib/extras-config";
import {
  getProfessoresDisponiveis,
  getTurmasExtras,
} from "@/lib/gestor-extras";

export default async function VincularProfessorTurmasPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  if (!isTipoAtividadeExtra(tipo)) notFound();

  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const [turmas, professores] = await Promise.all([
    getTurmasExtras(profile, tipo),
    getProfessoresDisponiveis(profile),
  ]);

  return (
    <>
      <GestorPageHeader
        title="Vincular ao Professor — Turmas"
        description={`${TIPOS_ATIVIDADE_EXTRA[tipo].label} — professor responsável por cada turma`}
      />
      <ProfessorExtraPanel
        turmas={turmas}
        professores={professores}
        cadastroTurmasHref={`/gestor/turmas/outras-opcoes/${tipo}/turmas`}
      />
    </>
  );
}
