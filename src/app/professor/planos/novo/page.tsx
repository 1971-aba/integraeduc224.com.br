import Link from "next/link";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { PlanoGerarForm } from "@/components/planos/plano-gerar-form";
import { requireRole } from "@/lib/auth";
import { getAiMode, getAiModeLabel } from "@/lib/ai/config";
import { getProfessorAtribuicoes } from "@/lib/diario";
import {
  filtrarSeriesPorNivel,
  tituloNivelPlano,
  type NivelEnsinoPlano,
} from "@/lib/professor-planos";

export default async function NovoPlanoPage({
  searchParams,
}: {
  searchParams: Promise<{ nivel?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["professor"]);
  const atribuicoes = await getProfessorAtribuicoes(profile.id);
  const aiMode = getAiMode();

  const nivel =
    params.nivel === "fundamental" || params.nivel === "infantil"
      ? (params.nivel as NivelEnsinoPlano)
      : undefined;

  const atribuicoesOptions = atribuicoes.map((item) => ({
    id: item.id,
    label: `${item.disciplinas?.nome ?? "Disciplina"} — ${item.turmas?.nome ?? "Turma"}`,
    disciplina: item.disciplinas?.nome ?? "",
  }));

  const voltarHref = nivel
    ? `/professor/planos/${nivel}`
    : "/professor/planos";

  return (
    <>
      <GestorPageHeader
        title={
          nivel
            ? `Novo Plano de Aula — ${tituloNivelPlano(nivel)}`
            : "Novo Plano de Aula"
        }
        description="Informe o tema e a série para gerar um plano alinhado à BNCC"
      />

      <Link
        href={voltarHref}
        className="mb-4 inline-flex text-sm font-medium text-blue-700 hover:underline"
      >
        ← Voltar aos planos
      </Link>

      <div className="mx-auto max-w-xl">
        <PlanoGerarForm
          atribuicoes={atribuicoesOptions}
          aiDisponivel
          providerLabel={getAiModeLabel(aiMode)}
          isDemoMode={aiMode === "demo"}
          seriesOptions={
            nivel ? filtrarSeriesPorNivel(nivel) : undefined
          }
        />
      </div>
    </>
  );
}
