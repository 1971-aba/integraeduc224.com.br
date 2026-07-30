import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FichaNotasProfessorView } from "@/components/professor/ficha-notas-professor-view";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { loadFichaNotasProfessor } from "@/lib/professor-boletim";

export default async function FichaNotasInfantilPage({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string; bimestre?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["professor"]);
  const { escolaId, turmas, turmaId, boletim } = await loadFichaNotasProfessor(
    profile.id,
    "infantil",
    params,
  );

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title="Ficha de Notas — Educação Infantil"
          description="Notas consolidadas por turma e aluno"
        />
        <Card>
          <CardTitle>Escola não vinculada</CardTitle>
          <CardDescription>
            Seu perfil não possui escola vinculada para consultar fichas.
          </CardDescription>
        </Card>
      </>
    );
  }

  return (
    <>
      <GestorPageHeader
        title="Ficha de Notas — Educação Infantil"
        description="Consulta de notas das turmas da educação infantil vinculadas a você"
      />
      <FichaNotasProfessorView
        titulo="Educação Infantil"
        descricao="Selecione uma turma da educação infantil para visualizar a ficha."
        turmas={turmas}
        turmaId={turmaId}
        bimestreId={params.bimestre}
        boletim={boletim}
      />
    </>
  );
}
