import Link from "next/link";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { PlanoGerarForm } from "@/components/planos/plano-gerar-form";
import { requireRole } from "@/lib/auth";
import { getAiMode, getAiModeLabel } from "@/lib/ai/config";
import { getProfessorAtribuicoes } from "@/lib/diario";

export default async function NovoPlanoPage() {
  const { profile } = await requireRole(["professor"]);
  const atribuicoes = await getProfessorAtribuicoes(profile.id);
  const aiMode = getAiMode();

  const atribuicoesOptions = atribuicoes.map((item) => ({
    id: item.id,
    label: `${item.disciplinas?.nome ?? "Disciplina"} — ${item.turmas?.nome ?? "Turma"}`,
    disciplina: item.disciplinas?.nome ?? "",
  }));

  return (
    <>
      <GestorPageHeader
        title="Novo Plano de Aula"
        description="Informe o tema e a série para gerar um plano alinhado à BNCC"
      />

      <Link
        href="/professor/planos"
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
        />
      </div>
    </>
  );
}
