import Link from "next/link";
import { notFound } from "next/navigation";

import { ChamadaForm } from "@/components/diario/chamada-form";
import { CorrigirFrequenciaLista } from "@/components/professor/corrigir-frequencia-lista";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { requireRole } from "@/lib/auth";
import { isChamadaTipo } from "@/lib/chamada-tipos";
import { getAtribuicaoForEscola } from "@/lib/diario";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";
import {
  listChamadasAtribuicao,
  loadChamadaContextEscola,
} from "@/lib/professor-frequencia";
import { createClient } from "@/lib/supabase/server";

const BASE_PATH =
  "/gestor/consultas/sala-de-aula/frequencia-turma/corrigir";

export default async function GestorSalaDeAulaCorrigirFrequenciaTurmaPage({
  params,
  searchParams,
}: {
  params: Promise<{ atribuicaoId: string }>;
  searchParams: Promise<{ data?: string; tipo?: string }>;
}) {
  const { atribuicaoId } = await params;
  const { data, tipo: tipoParam } = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getGestorEscolaId(profile);

  if (!escolaId) {
    notFound();
  }

  const supabase = await createClient();
  const atribuicao = await getAtribuicaoForEscola(atribuicaoId, escolaId);

  if (!atribuicao) {
    notFound();
  }

  const turmaLabel = `${atribuicao.disciplinas?.nome ?? "Disciplina"} — ${atribuicao.turmas?.nome ?? "Turma"}`;

  if (data && tipoParam && isChamadaTipo(tipoParam)) {
    const context = await loadChamadaContextEscola(
      supabase,
      atribuicaoId,
      escolaId,
      data,
      tipoParam,
      { permitirCorrecao: true },
    );

    if (!context) {
      notFound();
    }

    return (
      <>
        <GestorPageHeader
          title="Corrigir Frequência"
          description={`${turmaLabel} — ${data}`}
        />

        <Link
          href={`${BASE_PATH}/${atribuicaoId}`}
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
      basePath={BASE_PATH}
    />
  );
}
