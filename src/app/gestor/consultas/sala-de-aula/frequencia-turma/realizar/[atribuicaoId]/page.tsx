import Link from "next/link";
import { notFound } from "next/navigation";

import { ChamadaForm } from "@/components/diario/chamada-form";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { requireRole } from "@/lib/auth";
import { CHAMADA_TIPOS } from "@/lib/chamada-tipos";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";
import { loadChamadaContextEscola } from "@/lib/professor-frequencia";
import { createClient } from "@/lib/supabase/server";

const BASE_PATH =
  "/gestor/consultas/sala-de-aula/frequencia-turma/realizar";

export default async function GestorSalaDeAulaRealizarFrequenciaTurmaPage({
  params,
  searchParams,
}: {
  params: Promise<{ atribuicaoId: string }>;
  searchParams: Promise<{ data?: string }>;
}) {
  const { atribuicaoId } = await params;
  const { data: dataParam } = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getGestorEscolaId(profile);

  if (!escolaId) {
    notFound();
  }

  const data = dataParam ?? new Date().toISOString().slice(0, 10);
  const supabase = await createClient();
  const context = await loadChamadaContextEscola(
    supabase,
    atribuicaoId,
    escolaId,
    data,
    "regular",
  );

  if (!context) {
    notFound();
  }

  return (
    <>
      <GestorPageHeader
        title={CHAMADA_TIPOS.regular.label}
        description={context.turmaLabel}
      />

      <Link
        href={BASE_PATH}
        className="mb-4 inline-flex text-sm font-medium text-blue-700 hover:underline"
      >
        ← Voltar às turmas
      </Link>

      <ChamadaForm
        key={`${data}-regular`}
        atribuicaoId={atribuicaoId}
        dataInicial={data}
        alunos={context.alunos}
        diaLetivo={context.diaLetivo}
        tipo="regular"
      />
    </>
  );
}
