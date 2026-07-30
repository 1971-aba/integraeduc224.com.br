import { notFound } from "next/navigation";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { AtividadesExtrasPanel } from "@/components/gestor/extras/atividades-extras-panel";
import { requireRole } from "@/lib/auth";
import {
  isTipoAtividadeExtra,
  TIPOS_ATIVIDADE_EXTRA,
} from "@/lib/extras-config";
import { getAtividadesExtras } from "@/lib/gestor-extras";

export default async function CadastroAtividadesExtrasPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  if (!isTipoAtividadeExtra(tipo)) notFound();

  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const atividades = await getAtividadesExtras(profile, tipo);

  return (
    <>
      <GestorPageHeader
        title="Cadastro de Atividades"
        description={`${TIPOS_ATIVIDADE_EXTRA[tipo].label} — ${TIPOS_ATIVIDADE_EXTRA[tipo].descricao}`}
      />
      <AtividadesExtrasPanel tipo={tipo} atividades={atividades} />
    </>
  );
}
