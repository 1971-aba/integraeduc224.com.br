import { notFound } from "next/navigation";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { VincularAlunosProjetoPanel } from "@/components/gestor/vincular-alunos-projeto-panel";
import { getContextoProgramasProjetos } from "@/lib/gestor-programas-projetos";
import {
  TIPOS_PROGRAMA_PROJETO,
  resolverTipo,
} from "@/lib/programas-projetos-config";

export default async function VincularAlunosProgramasProjetosPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo: slug } = await params;
  const tipo = resolverTipo(slug);

  if (!tipo) notFound();

  const textos = TIPOS_PROGRAMA_PROJETO[tipo];
  const contexto = await getContextoProgramasProjetos(tipo);

  if (!contexto) {
    return (
      <>
        <GestorPageHeader
          title="Vincular Alunos"
          description={`Alunos participantes de cada ${textos.singular.toLowerCase()}`}
        />
        <SemEscolaAlert />
      </>
    );
  }

  return (
    <>
      <GestorPageHeader
        title="Vincular Alunos"
        description={`Escolha os participantes de cada ${textos.singular.toLowerCase()} · ${
          contexto.escolaNome
        }`}
      />

      <VincularAlunosProjetoPanel
        tipo={tipo}
        itens={contexto.itens}
        alunos={contexto.alunos}
        vinculosPorItem={contexto.vinculosPorItem}
        cadastroHref={`/gestor/alunos/outras-opcoes/programas-projetos/${slug}/fundamental`}
      />
    </>
  );
}
