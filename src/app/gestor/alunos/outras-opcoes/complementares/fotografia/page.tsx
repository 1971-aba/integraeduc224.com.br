import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FotografiaAlunoPanel } from "@/components/gestor/fotografia-aluno-panel";
import { getContextoComplementares } from "@/lib/gestor-alunos-complementares";

export default async function FotografiaAlunoPage() {
  const contexto = await getContextoComplementares();

  if (!contexto) {
    return (
      <>
        <GestorPageHeader
          title="Incluir Fotografia do Aluno"
          description="Foto usada na carteirinha do estudante"
        />
        <SemEscolaAlert />
      </>
    );
  }

  return (
    <>
      <GestorPageHeader
        title="Incluir Fotografia do Aluno"
        description={`Foto usada na carteirinha do estudante · ${contexto.escolaNome}`}
      />

      <FotografiaAlunoPanel alunos={contexto.alunos} />
    </>
  );
}
