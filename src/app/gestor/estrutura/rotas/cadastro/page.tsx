import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { RotasOnibusPanel } from "@/components/gestor/rotas-onibus-panel";
import { getRotasOnibus } from "@/lib/gestor-estrutura-outros";

export default async function CadastroRotasPage() {
  const contexto = await getRotasOnibus();

  if (!contexto) {
    return (
      <>
        <GestorPageHeader
          title="Cadastro de Rotas"
          description="Rotas do transporte escolar"
        />
        <SemEscolaAlert />
      </>
    );
  }

  return (
    <>
      <GestorPageHeader
        title="Cadastro de Rotas"
        description={`Transporte escolar · ${contexto.escolaNome}`}
      />

      <RotasOnibusPanel rotas={contexto.rotas} modo="cadastro" />
    </>
  );
}
