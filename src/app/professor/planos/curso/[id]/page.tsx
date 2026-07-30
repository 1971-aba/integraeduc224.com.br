import Link from "next/link";
import { notFound } from "next/navigation";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { PlanoCursoEditor } from "@/components/professor/plano-curso-editor";
import { requireRole } from "@/lib/auth";
import { getPlanoCursoById } from "@/lib/professor-plano-curso";
import { tituloNivelPlano } from "@/lib/professor-planos";

export default async function PlanoCursoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await requireRole(["professor"]);
  const plano = await getPlanoCursoById(id, profile.id);

  if (!plano) notFound();

  return (
    <>
      <GestorPageHeader
        title="Plano de Curso"
        description={`${tituloNivelPlano(plano.nivel)} • ${plano.disciplina}`}
      />

      <Link
        href={`/professor/planos/curso/${plano.nivel}`}
        className="mb-4 inline-flex text-sm font-medium text-blue-700 hover:underline"
      >
        ← Voltar aos planos de curso
      </Link>

      <PlanoCursoEditor
        planoId={plano.id}
        titulo={plano.titulo}
        disciplina={plano.disciplina}
        serie={plano.serie}
        nivel={plano.nivel}
        conteudoInicial={plano.conteudo_final ?? plano.conteudo_ia}
      />
    </>
  );
}
