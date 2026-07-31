import { GestorOcorrenciasView } from "@/components/gestor/gestor-ocorrencias-view";

export default function GestorOcorrenciasEstruturaPage() {
  return (
    <GestorOcorrenciasView
      categoria="estrutura"
      title="Estrutura e Outros"
      description="Ocorrências de infraestrutura, patrimônio e demais registros da unidade escolar"
    />
  );
}
