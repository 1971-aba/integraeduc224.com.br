import { GestorOcorrenciasView } from "@/components/gestor/gestor-ocorrencias-view";

export default function GestorOcorrenciasEstruturaInformarPage() {
  return (
    <GestorOcorrenciasView
      categoria="estrutura"
      status="informada"
      title="Informar"
      description="Registrar ocorrências de infraestrutura, patrimônio e demais registros da unidade"
      mostrarFormulario
      permitirMarcarAtendida
    />
  );
}
