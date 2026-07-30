import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { ResponsaveisPanel } from "@/components/gestor/responsaveis-panel";
import { getContextoResponsaveis } from "@/lib/gestor-responsaveis";

export default async function CadastroResponsaveisPage() {
  const contexto = await getContextoResponsaveis();

  if (!contexto) {
    return (
      <>
        <GestorPageHeader
          title="Cadastro de Responsáveis"
          description="Dados dos responsáveis legais e autorizados a retirar o aluno"
        />
        <SemEscolaAlert />
      </>
    );
  }

  return (
    <>
      <GestorPageHeader
        title="Cadastro de Responsáveis"
        description={`Dados dos responsáveis legais e autorizados a retirar o aluno · ${contexto.escolaNome}`}
      />

      <ResponsaveisPanel alunos={contexto.alunos} />
    </>
  );
}
