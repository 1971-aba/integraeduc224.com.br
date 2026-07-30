import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FrequenciaAnualDisciplinaView } from "@/components/professor/frequencia-anual-disciplina-view";
import { requireRole } from "@/lib/auth";
import {
  agruparFrequenciaPorDisciplinaAnual,
  filtrarPorTexto,
} from "@/lib/professor-frequencia-escolar";
import { getFrequenciaAnualConsolidada } from "@/lib/professor-diario";

const BASE_PATH = "/professor/frequencia-escolar/anual/disciplina";

export default async function FrequenciaAnualDisciplinaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["professor"]);

  const resumos = await getFrequenciaAnualConsolidada(profile.id);
  const disciplinas = filtrarPorTexto(
    agruparFrequenciaPorDisciplinaAnual(resumos),
    params.q,
    ["disciplina", "turmas"],
  );

  return (
    <>
      <GestorPageHeader
        title="Disciplina %"
        description="Percentual de frequência anual por disciplina lecionada"
      />
      <FrequenciaAnualDisciplinaView
        disciplinas={disciplinas}
        busca={params.q}
        basePath={BASE_PATH}
      />
    </>
  );
}
