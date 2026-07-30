import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { PlanoCursoListaView } from "@/components/professor/plano-curso-lista-view";
import { requireRole } from "@/lib/auth";
import { getPlanosCursoProfessor } from "@/lib/professor-plano-curso";
import { tituloNivelPlano } from "@/lib/professor-planos";

export default async function PlanoCursoInfantilPage() {
  const { profile } = await requireRole(["professor"]);
  const planos = await getPlanosCursoProfessor(profile.id, "infantil");
  const titulo = tituloNivelPlano("infantil");

  return (
    <>
      <GestorPageHeader
        title={`Plano de Curso — ${titulo}`}
        description="Planos anuais das disciplinas da educação infantil"
      />
      <PlanoCursoListaView
        planos={planos}
        nivelLabel={titulo.toLowerCase()}
        novoHref="/professor/planos/curso/novo?nivel=infantil"
      />
    </>
  );
}
