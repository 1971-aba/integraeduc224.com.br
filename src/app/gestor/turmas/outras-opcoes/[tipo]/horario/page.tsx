import { notFound } from "next/navigation";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { HorarioExtraPanel } from "@/components/gestor/extras/horario-extra-panel";
import { requireRole } from "@/lib/auth";
import {
  isTipoAtividadeExtra,
  TIPOS_ATIVIDADE_EXTRA,
} from "@/lib/extras-config";
import { getHorariosExtras, getTurmasExtras } from "@/lib/gestor-extras";

export default async function HorarioComplementarPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  if (!isTipoAtividadeExtra(tipo)) notFound();

  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const [turmas, horarios] = await Promise.all([
    getTurmasExtras(profile, tipo),
    getHorariosExtras(profile, tipo),
  ]);

  return (
    <>
      <GestorPageHeader
        title="Horário Complementar"
        description={`${TIPOS_ATIVIDADE_EXTRA[tipo].label} — grade semanal dos atendimentos`}
      />
      <HorarioExtraPanel turmas={turmas} horarios={horarios} />
    </>
  );
}
