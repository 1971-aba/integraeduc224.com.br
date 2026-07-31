import { GestorOcorrenciasView } from "@/components/gestor/gestor-ocorrencias-view";

export default function GestorOcorrenciasAlunosPage() {
  return (
    <GestorOcorrenciasView
      categoria="alunos"
      title="Alunos e Outros"
      description="Ocorrências disciplinares, pedagógicas, de saúde e demais registros envolvendo alunos"
    />
  );
}
