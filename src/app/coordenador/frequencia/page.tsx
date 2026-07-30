import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { FrequenciaConsolidadaView } from "@/components/consultas/frequencia-consolidada-view";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { requireRole } from "@/lib/auth";
import {
  getCoordenadorEscolaId,
  getEscolaBimestreOptions,
  getFrequenciaConsolidadaEscola,
} from "@/lib/coordenador-data";
import {
  filtrarFrequenciaPorPercentual,
  parseFrequenciaPercentualFiltro,
} from "@/lib/professor-diario";
import { createClient } from "@/lib/supabase/server";

export default async function CoordenadorFrequenciaPage({
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
  const { profile } = await requireRole(["coordenador", "admin_sme"]);
  const escolaId = getCoordenadorEscolaId(profile);

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title="Frequência Escolar"
          description="Percentual de presença por turma e aluno na unidade"
        />
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
        title="Frequência Escolar"
        description="Consolidado de presença de todas as turmas da escola"
      />

      <FrequenciaConsolidadaView
        resumos={resumos}
        bimestres={bimestres}
        bimestreId={bimestreId}
        filtro={filtro}
        basePath="/coordenador/frequencia"
      />
    </>
  );
}
