import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FrequenciaAnualTurmaView } from "@/components/professor/frequencia-anual-turma-view";
import { requireRole } from "@/lib/auth";
import {
  agruparFrequenciaPorTurmaAnual,
  filtrarPorTexto,
} from "@/lib/professor-frequencia-escolar";
import { getFrequenciaAnualConsolidada } from "@/lib/professor-diario";

const BASE_PATH = "/professor/frequencia-escolar/anual/turma";

export default async function FrequenciaAnualTurmaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["professor"]);

  const resumos = await getFrequenciaAnualConsolidada(profile.id);
  const turmas = filtrarPorTexto(
    agruparFrequenciaPorTurmaAnual(resumos),
    params.q,
    ["turma", "serie", "turno", "disciplinas"],
  );

  return (
    <>
      <GestorPageHeader
        title="Turma Ano %"
        description="Percentual de frequência anual consolidado por turma"
      />
      <FrequenciaAnualTurmaView
        turmas={turmas}
        busca={params.q}
        basePath={BASE_PATH}
      />
    </>
  );
}
