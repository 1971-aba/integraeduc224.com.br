import { notFound } from "next/navigation";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { DocumentoAlunoPanel } from "@/components/gestor/documento-aluno-panel";
import {
  DOCUMENTOS_ALUNO,
  isDocumentoAlunoId,
} from "@/lib/documentos-aluno-config";
import { getContextoDocumento } from "@/lib/gestor-documentos-alunos";

type DocumentacaoPageProps = {
  params: Promise<{ documento: string }>;
};

export default async function DocumentacaoPage({
  params,
}: DocumentacaoPageProps) {
  const { documento: slug } = await params;

  if (!isDocumentoAlunoId(slug)) notFound();

  const documento = DOCUMENTOS_ALUNO[slug];
  const contexto = await getContextoDocumento(documento);

  if (!contexto) {
    return (
      <>
        <GestorPageHeader
          title={documento.titulo}
          description={documento.descricao}
        />
        <SemEscolaAlert />
      </>
    );
  }

  return (
    <>
      <GestorPageHeader
        title={documento.titulo}
        description={`${documento.descricao} · ${contexto.escolaNome}`}
      />

      <DocumentoAlunoPanel
        documento={documento}
        pendentes={contexto.pendentes}
        informados={contexto.informados}
      />
    </>
  );
}
