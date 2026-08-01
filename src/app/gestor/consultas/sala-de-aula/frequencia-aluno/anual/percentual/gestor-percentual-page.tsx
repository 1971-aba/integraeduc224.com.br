import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FrequenciaAnualPercentualView } from "@/components/professor/frequencia-anual-percentual-view";
import { requireRole } from "@/lib/auth";
import { getFrequenciaConsolidadaEscola } from "@/lib/coordenador-data";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";
import {
  filtrarFrequenciaPorPercentual,
  parseFrequenciaPercentualFiltro,
} from "@/lib/professor-diario";

const BASE_PATH =
  "/gestor/consultas/sala-de-aula/frequencia-aluno/anual/percentual";

type GestorPercentualModo = "lte" | "between";

const ROTAS_PERCENTUAL: Record<
  GestorPercentualModo,
  { slug: string; label: string }
> = {
  lte: {
    slug: "menor-ou-igual-a",
    label: "Menor ou Igual a:",
  },
  between: {
    slug: "entre",
    label: "Entre:",
  },
};

export async function GestorPercentualAtingidoPage({
  modoDestaque,
  searchParams,
}: {
  modoDestaque: GestorPercentualModo;
  searchParams: Promise<{
    tipo?: string;
    max?: string;
    min?: string;
    maxRange?: string;
  }>;
}) {
  const params = await searchParams;
  const filtro = parseFrequenciaPercentualFiltro(params);
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getGestorEscolaId(profile);
  const rota = ROTAS_PERCENTUAL[modoDestaque];

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title="Percentual Atingido"
          description={rota.label}
          actions={<BackLink />}
        />
        <SemEscolaAlert />
      </>
    );
  }

  const resumosBrutos = await getFrequenciaConsolidadaEscola(
    escolaId,
    undefined,
    "anual",
  );
  const resumos = filtrarFrequenciaPorPercentual(resumosBrutos, filtro);

  return (
    <>
      <GestorPageHeader
        title="Percentual Atingido"
        description={`${rota.label} filtro por frequência acumulada no ano letivo`}
        actions={<BackLink />}
      />
      <FrequenciaAnualPercentualView
        resumos={resumos}
        filtro={filtro}
        basePath={`${BASE_PATH}/${rota.slug}`}
        modoDestaque={modoDestaque}
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
