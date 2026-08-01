import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FrequenciaAnualDisciplinaView } from "@/components/professor/frequencia-anual-disciplina-view";
import { requireRole } from "@/lib/auth";
import { getFrequenciaConsolidadaEscola } from "@/lib/coordenador-data";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";
import {
  agruparFrequenciaPorDisciplinaAnual,
  filtrarPorTexto,
} from "@/lib/professor-frequencia-escolar";

const BASE_PATH =
  "/gestor/consultas/sala-de-aula/frequencia-aluno/anual/disciplina";

export default async function GestorSalaDeAulaFrequenciaAnualDisciplinaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getGestorEscolaId(profile);

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title="Disciplina Ano %"
          actions={<BackLink />}
        />
        <SemEscolaAlert />
      </>
    );
  }

  const resumos = await getFrequenciaConsolidadaEscola(
    escolaId,
    undefined,
    "anual",
  );
  const disciplinas = filtrarPorTexto(
    agruparFrequenciaPorDisciplinaAnual(resumos),
    params.q,
    ["disciplina", "turmas"],
  );

  return (
    <>
      <GestorPageHeader
        title="Disciplina Ano %"
        description="Percentual de frequência anual por disciplina lecionada"
        actions={<BackLink />}
      />
      <FrequenciaAnualDisciplinaView
        disciplinas={disciplinas}
        busca={params.q}
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
