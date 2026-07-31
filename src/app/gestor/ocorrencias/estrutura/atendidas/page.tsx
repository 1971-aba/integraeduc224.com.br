import { GestorOcorrenciasView } from "@/components/gestor/gestor-ocorrencias-view";

export default function GestorOcorrenciasEstruturaAtendidasPage() {
  return (
    <GestorOcorrenciasView
      categoria="estrutura"
      status="atendida"
      title="Atendidas"
      description="Ocorrências de estrutura já atendidas pela unidade escolar"
      listaTitulo="Ocorrências atendidas"
    />
  );
}
