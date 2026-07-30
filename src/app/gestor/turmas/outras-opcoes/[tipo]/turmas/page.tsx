import { notFound } from "next/navigation";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { TurmasExtrasPanel } from "@/components/gestor/extras/turmas-extras-panel";
import { requireRole } from "@/lib/auth";
import {
  isTipoAtividadeExtra,
  TIPOS_ATIVIDADE_EXTRA,
} from "@/lib/extras-config";
import { getAtividadesExtras, getTurmasExtras } from "@/lib/gestor-extras";

export default async function CadastroTurmasExtrasPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  if (!isTipoAtividadeExtra(tipo)) notFound();

  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const [turmas, atividades] = await Promise.all([
    getTurmasExtras(profile, tipo),
    getAtividadesExtras(profile, tipo),
  ]);

  return (
    <>
      <GestorPageHeader
        title="Cadastro de Turmas"
        description={`${TIPOS_ATIVIDADE_EXTRA[tipo].label} — turmas e grupos de atendimento`}
      />
      <TurmasExtrasPanel
        tipo={tipo}
        turmas={turmas}
        atividades={atividades}
      />
    </>
  );
}
