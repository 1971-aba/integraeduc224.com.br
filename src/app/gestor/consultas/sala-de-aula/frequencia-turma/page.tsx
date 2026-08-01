import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { FrequenciaConsolidadaView } from "@/components/consultas/frequencia-consolidada-view";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { requireRole } from "@/lib/auth";
import {
  getEscolaBimestreOptions,
  getFrequenciaConsolidadaEscola,
} from "@/lib/coordenador-data";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";
import {
  filtrarFrequenciaPorPercentual,
  parseFrequenciaPercentualFiltro,
} from "@/lib/professor-diario";
import { createClient } from "@/lib/supabase/server";

const BASE_PATH = "/gestor/consultas/sala-de-aula/frequencia-turma";

export default async function GestorSalaDeAulaFrequenciaTurmaPage({
  searchParams,
}: {
  searchParams: Promise<{
    bimestre?: string;
    tipo?: string;
    max?: string;
    min?: string;
    maxRange?: string;
  }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getGestorEscolaId(profile);

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader title="Frequência Turma" actions={<BackLink />} />
        <SemEscolaAlert />
      </>
    );
  }

  const supabase = await createClient();
  const filtro = parseFrequenciaPercentualFiltro(params);
  const bimestreId = params.bimestre;

  const [resumosBrutos, bimestres] = await Promise.all([
    getFrequenciaConsolidadaEscola(escolaId, bimestreId),
    getEscolaBimestreOptions(supabase, escolaId),
  ]);

  const resumos = filtrarFrequenciaPorPercentual(resumosBrutos, filtro);

  return (
    <>
      <GestorPageHeader
        title="Frequência Turma"
        description="Percentual de presença consolidado por turma"
        actions={<BackLink />}
      />

      <FrequenciaConsolidadaView
        resumos={resumos}
        bimestres={bimestres}
        bimestreId={bimestreId}
        filtro={filtro}
        basePath={BASE_PATH}
      />
    </>
  );
}

function BackLink() {
  return (
    <Link
      href="/gestor/relatorios"
      className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Relatórios
    </Link>
  );
}
