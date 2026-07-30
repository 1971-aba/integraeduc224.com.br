import { notFound } from "next/navigation";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { VinculosExtrasPanel } from "@/components/gestor/extras/vinculos-extras-panel";
import { requireRole } from "@/lib/auth";
import {
  isTipoAtividadeExtra,
  TIPOS_ATIVIDADE_EXTRA,
} from "@/lib/extras-config";
import {
  getAtividadesExtras,
  getProfessoresDisponiveis,
  getProfessoresPorAtividade,
} from "@/lib/gestor-extras";

export default async function VincularProfessorAtividadesPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  if (!isTipoAtividadeExtra(tipo)) notFound();

  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const atividades = await getAtividadesExtras(profile, tipo);
  const [vinculos, professores] = await Promise.all([
    getProfessoresPorAtividade(atividades.map((atividade) => atividade.id)),
    getProfessoresDisponiveis(profile),
  ]);

  return (
    <>
      <GestorPageHeader
        title="Vincular ao Professor — Atividades"
        description={`${TIPOS_ATIVIDADE_EXTRA[tipo].label} — professores que conduzem cada atividade`}
      />
      <VinculosExtrasPanel
        kind="professores"
        grupos={atividades.map((atividade) => ({
          id: atividade.id,
          titulo: atividade.nome,
          subtitulo: [
            atividade.cargaHorariaSemanal
              ? `${atividade.cargaHorariaSemanal}h semanais`
              : null,
            `${atividade.turmas} turma(s)`,
          ]
            .filter(Boolean)
            .join(" • "),
        }))}
        vinculosPorGrupo={Object.fromEntries(vinculos)}
        opcoes={professores}
        emptyTitle="Nenhuma atividade cadastrada"
        emptyDescription="Cadastre uma atividade antes de vincular professores."
        emptyActionHref={`/gestor/turmas/outras-opcoes/${tipo}/atividades`}
        emptyActionLabel="Cadastrar atividade"
      />
    </>
  );
}
