import Link from "next/link";
import { notFound } from "next/navigation";

import { DiarioTabs } from "@/components/diario/diario-tabs";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { requireRole } from "@/lib/auth";
import { getAtribuicaoForProfessor } from "@/lib/diario";

export default async function TurmaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ atribuicaoId: string }>;
}) {
  const { atribuicaoId } = await params;
  const { profile } = await requireRole(["professor"]);
  const atribuicao = await getAtribuicaoForProfessor(
    atribuicaoId,
    profile.id,
  );

  if (!atribuicao) {
    notFound();
  }

  const turma = atribuicao.turmas;
  const disciplina = atribuicao.disciplinas;

  return (
    <>
      <GestorPageHeader
        title={`${disciplina?.nome} — ${turma?.nome}`}
        description={`${turma?.serie} • ${turma?.turno}`}
      />

      <Link
        href="/professor/turmas"
        className="mb-4 inline-flex text-sm font-medium text-blue-700 hover:underline"
      >
        ← Voltar às turmas
      </Link>

      {children}

      <div className="h-20 sm:hidden" aria-hidden="true" />
      <DiarioTabs atribuicaoId={atribuicaoId} />
    </>
  );
}
