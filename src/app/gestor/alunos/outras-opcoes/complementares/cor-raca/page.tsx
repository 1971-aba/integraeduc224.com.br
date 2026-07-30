import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { CorRacaPanel } from "@/components/gestor/cor-raca-panel";
import { getContextoComplementares } from "@/lib/gestor-alunos-complementares";

export default async function CorRacaPage() {
  const contexto = await getContextoComplementares();

  if (!contexto) {
    return (
      <>
        <GestorPageHeader
          title="Informar Cor / Raça / Etnia"
          description="Declaração exigida pelo Censo Escolar"
        />
        <SemEscolaAlert />
      </>
    );
  }

  return (
    <>
      <GestorPageHeader
        title="Informar Cor / Raça / Etnia"
        description={`Declaração exigida pelo Censo Escolar · ${contexto.escolaNome}`}
      />

      <CorRacaPanel alunos={contexto.alunos} />
    </>
  );
}
