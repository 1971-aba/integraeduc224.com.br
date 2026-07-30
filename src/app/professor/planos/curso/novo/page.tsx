import Link from "next/link";
import { notFound } from "next/navigation";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { PlanoCursoGerarForm } from "@/components/professor/plano-curso-gerar-form";
import { requireRole } from "@/lib/auth";
import { classificarSerieBoletim } from "@/lib/professor-boletim";
import { getProfessorAtribuicoes } from "@/lib/diario";
import {
  filtrarSeriesPorNivel,
  tituloNivelPlano,
  type NivelEnsinoPlano,
} from "@/lib/professor-planos";

export default async function NovoPlanoCursoPage({
  searchParams,
}: {
  searchParams: Promise<{ nivel?: string }>;
}) {
  const params = await searchParams;
  const nivel =
    params.nivel === "fundamental" || params.nivel === "infantil"
      ? (params.nivel as NivelEnsinoPlano)
      : null;

  if (!nivel) notFound();

  const { profile } = await requireRole(["professor"]);
  const atribuicoes = await getProfessorAtribuicoes(profile.id);
  const titulo = tituloNivelPlano(nivel);

  const atribuicoesNivel = atribuicoes
    .filter(
      (item) =>
        item.turmas?.serie &&
        classificarSerieBoletim(item.turmas.serie) === nivel,
    )
    .map((item) => ({
      id: item.id,
      label: `${item.disciplinas?.nome ?? "Disciplina"} — ${item.turmas?.nome ?? "Turma"}`,
      disciplina: item.disciplinas?.nome ?? "",
      serie: item.turmas?.serie ?? "",
    }));

  return (
    <>
      <GestorPageHeader
        title={`Novo Plano de Curso — ${titulo}`}
        description="Elaboração do plano anual da disciplina"
      />

      <Link
        href={`/professor/planos/curso/${nivel}`}
        className="mb-4 inline-flex text-sm font-medium text-blue-700 hover:underline"
      >
        ← Voltar aos planos de curso
      </Link>

      <div className="mx-auto max-w-xl">
        <PlanoCursoGerarForm
          nivel={nivel}
          nivelLabel={titulo}
          seriesOptions={filtrarSeriesPorNivel(nivel)}
          atribuicoes={atribuicoesNivel}
        />
      </div>
    </>
  );
}
