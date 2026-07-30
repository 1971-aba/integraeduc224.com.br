import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { VincularAlunoPanel } from "@/components/gestor/vincular-aluno-panel";
import { getContextoVinculo } from "@/lib/gestor-alunos-vinculo";

export default async function VincularParaMatriculaPage() {
  const contexto = await getContextoVinculo();

  if (!contexto) {
    return (
      <>
        <GestorPageHeader
          title="Vincular para Matrícula"
          description="Alunos da rede que ainda não têm vínculo com esta escola"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const alunos = contexto.alunos.filter(
    (aluno) => aluno.situacao === "matricula",
  );

  return (
    <>
      <GestorPageHeader
        title="Vincular para Matrícula"
        description={`Alunos já cadastrados na rede, sem vínculo ativo, prontos para matricular em ${contexto.escolaNome}`}
      />

      <VincularAlunoPanel
        alunos={alunos}
        turmas={contexto.turmas}
        acaoLabel="Matricular"
        vazioTitulo="Nenhum aluno aguardando matrícula"
        vazioDescricao="Todos os alunos da rede sem vínculo ativo já estão matriculados nesta escola, ou aparecem em Receber Transferências e Resgatar Evasão Escolar."
      />
    </>
  );
}
