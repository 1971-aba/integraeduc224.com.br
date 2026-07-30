import { renderToBuffer } from "@react-pdf/renderer";

import { PlanoAulaPdfDocument } from "@/lib/pdf/plano-aula-document";

type RenderPlanoPdfInput = {
  cabecalho: string;
  subtitulo: string;
  tema: string;
  serie: string;
  disciplina?: string | null;
  professor: string;
  conteudo: string;
  dataEmissao: string;
};

export async function renderPlanoAulaPdf(input: RenderPlanoPdfInput) {
  return renderToBuffer(
    <PlanoAulaPdfDocument
      cabecalho={input.cabecalho}
      subtitulo={input.subtitulo}
      tema={input.tema}
      serie={input.serie}
      disciplina={input.disciplina}
      professor={input.professor}
      conteudo={input.conteudo}
      dataEmissao={input.dataEmissao}
    />,
  );
}
