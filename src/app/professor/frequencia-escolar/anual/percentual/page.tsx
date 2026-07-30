import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FrequenciaAnualPercentualView } from "@/components/professor/frequencia-anual-percentual-view";
import { requireRole } from "@/lib/auth";
import {
  filtrarFrequenciaPorPercentual,
  getFrequenciaAnualConsolidada,
  parseFrequenciaPercentualFiltro,
} from "@/lib/professor-diario";

const BASE_PATH = "/professor/frequencia-escolar/anual/percentual";

export default async function FrequenciaAnualPercentualPage({
  searchParams,
}: {
  searchParams: Promise<{
    tipo?: string;
    max?: string;
    min?: string;
    maxRange?: string;
  }>;
}) {
  const params = await searchParams;
  const filtro = parseFrequenciaPercentualFiltro(params);
  const { profile } = await requireRole(["professor"]);

  const resumosBrutos = await getFrequenciaAnualConsolidada(profile.id);
  const resumos = filtrarFrequenciaPorPercentual(resumosBrutos, filtro);

  return (
    <>
      <GestorPageHeader
        title="Percentual Atingido"
        description="Alunos filtrados pela frequência acumulada no ano letivo"
      />
      <FrequenciaAnualPercentualView
        resumos={resumos}
        filtro={filtro}
        basePath={BASE_PATH}
      />
    </>
  );
}
