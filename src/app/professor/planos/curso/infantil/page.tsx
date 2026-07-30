import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { PlanoCursoView } from "@/components/professor/plano-curso-view";
import { requireRole } from "@/lib/auth";
import {
  agruparPlanosCurso,
  getPlanosProfessor,
  tituloNivelPlano,
} from "@/lib/professor-planos";

export default async function PlanoCursoInfantilPage() {
  const { profile } = await requireRole(["professor"]);
  const grupos = agruparPlanosCurso(
    await getPlanosProfessor(profile.id),
    "infantil",
  );
  const titulo = tituloNivelPlano("infantil");

  return (
    <>
      <GestorPageHeader
        title={`Plano de Curso — ${titulo}`}
        description={`Visão consolidada dos planos por disciplina e série (${titulo.toLowerCase()})`}
      />
      <PlanoCursoView
        grupos={grupos}
        novoHref="/professor/planos/novo?nivel=infantil"
        nivelLabel={titulo.toLowerCase()}
      />
    </>
  );
}
