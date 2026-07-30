import Link from "next/link";
import { notFound } from "next/navigation";

import { ChamadaForm } from "@/components/diario/chamada-form";
import { CorrigirFrequenciaLista } from "@/components/professor/corrigir-frequencia-lista";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { requireRole } from "@/lib/auth";
import { isChamadaTipo } from "@/lib/chamada-tipos";
import {
  listChamadasAtribuicao,
  loadChamadaContext,
} from "@/lib/professor-frequencia";
import { getAtribuicaoForProfessor } from "@/lib/diario";
import { createClient } from "@/lib/supabase/server";

export default async function CorrigirFrequenciaTurmaPage({
  params,
  searchParams,
}: {
  params: Promise<{ atribuicaoId: string }>;
  searchParams: Promise<{ data?: string; tipo?: string }>;
}) {
  const { atribuicaoId } = await params;
  const { data, tipo: tipoParam } = await searchParams;
  const { profile } = await requireRole(["professor"]);
  const supabase = await createClient();

  const atribuicao = await getAtribuicaoForProfessor(
    atribuicaoId,
    profile.id,
  );
  if (!atribuicao) notFound();

  const turmaLabel = `${atribuicao.disciplinas?.nome ?? "Disciplina"} — ${atribuicao.turmas?.nome ?? "Turma"}`;

  if (data && tipoParam && isChamadaTipo(tipoParam)) {
    const context = await loadChamadaContext(
      supabase,
      atribuicaoId,
      profile.id,
      data,
      tipoParam,
      { permitirCorrecao: true },
    );

    if (!context) notFound();

    return (
      <>
        <GestorPageHeader
          title="Corrigir Frequência"
          description={`${turmaLabel} — ${data}`}
        />

        <Link
          href={`/professor/frequencia/corrigir/${atribuicaoId}`}
          className="mb-4 inline-flex text-sm font-medium text-blue-700 hover:underline"
        >
          ← Voltar à lista
        </Link>

        <ChamadaForm
          key={`${data}-${tipoParam}`}
          atribuicaoId={atribuicaoId}
          dataInicial={data}
          alunos={context.alunos}
          diaLetivo={true}
          tipo={tipoParam}
          observacaoInicial={context.observacao}
          permitirCorrecao
        />
      </>
    );
  }

  const chamadas = await listChamadasAtribuicao(supabase, atribuicaoId);

  return (
    <CorrigirFrequenciaLista
      atribuicaoId={atribuicaoId}
      turmaLabel={turmaLabel}
      chamadas={chamadas}
    />
  );
}
