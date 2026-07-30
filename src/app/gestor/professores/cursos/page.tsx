import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FormacaoProfessorPanel } from "@/components/gestor/formacao-professor-panel";
import { getContextoFormacao } from "@/lib/gestor-professores";

export default async function CursosEspecializacoesPage() {
  const contexto = await getContextoFormacao();

  if (!contexto) {
    return (
      <>
        <GestorPageHeader
          title="Cursos e Especializações"
          description="Formação acadêmica dos professores da unidade"
        />
        <SemEscolaAlert />
      </>
    );
  }

  return (
    <>
      <GestorPageHeader
        title="Cursos e Especializações"
        description={`Graduação, pós-graduação e cursos dos professores · ${contexto.escolaNome}`}
      />

      <FormacaoProfessorPanel
        professores={contexto.professores}
        formacoes={contexto.formacoes}
      />
    </>
  );
}
