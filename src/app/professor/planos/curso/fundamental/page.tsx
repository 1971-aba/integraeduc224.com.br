import Link from "next/link";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { PlanoCursoListaView } from "@/components/professor/plano-curso-lista-view";
import { requireRole } from "@/lib/auth";
import { getPlanosCursoProfessor } from "@/lib/professor-plano-curso";
import { tituloNivelPlano } from "@/lib/professor-planos";

export default async function PlanoCursoFundamentalPage() {
  const { profile } = await requireRole(["professor"]);
  const planos = await getPlanosCursoProfessor(profile.id, "fundamental");
  const titulo = tituloNivelPlano("fundamental");

  return (
    <>
      <GestorPageHeader
        title={`Plano de Curso — ${titulo}`}
        description="Planos anuais das disciplinas do ensino fundamental"
      />
      <PlanoCursoListaView
        planos={planos}
        nivelLabel={titulo.toLowerCase()}
        novoHref="/professor/planos/curso/novo?nivel=fundamental"
      />
    </>
  );
}
