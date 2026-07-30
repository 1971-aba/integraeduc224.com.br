import { notFound } from "next/navigation";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { ProgramasProjetosPanel } from "@/components/gestor/programas-projetos-panel";
import { getContextoProgramasProjetos } from "@/lib/gestor-programas-projetos";
import {
  ETAPAS_PROGRAMA_PROJETO,
  TIPOS_PROGRAMA_PROJETO,
  resolverTipo,
} from "@/lib/programas-projetos-config";

export default async function ProgramasProjetosInfantilPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo: slug } = await params;
  const tipo = resolverTipo(slug);

  if (!tipo) notFound();

  const textos = TIPOS_PROGRAMA_PROJETO[tipo];
  const etapa = ETAPAS_PROGRAMA_PROJETO.infantil;
  const contexto = await getContextoProgramasProjetos(tipo, "infantil");

  if (!contexto) {
    return (
      <>
        <GestorPageHeader
          title={`${textos.plural} — Educação Infantil`}
          description={etapa.descricao}
        />
        <SemEscolaAlert />
      </>
    );
  }

  return (
    <>
      <GestorPageHeader
        title={`${textos.plural} — Educação Infantil`}
        description={`${etapa.descricao} · ${contexto.escolaNome}`}
      />

      <ProgramasProjetosPanel
        tipo={tipo}
        etapa="infantil"
        itens={contexto.itens}
        vincularHref={`/gestor/alunos/outras-opcoes/programas-projetos/${slug}/vincular`}
      />
    </>
  );
}
