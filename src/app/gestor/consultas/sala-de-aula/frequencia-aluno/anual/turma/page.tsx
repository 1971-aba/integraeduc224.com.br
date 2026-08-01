import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FrequenciaAnualTurmaView } from "@/components/professor/frequencia-anual-turma-view";
import { requireRole } from "@/lib/auth";
import { getFrequenciaConsolidadaEscola } from "@/lib/coordenador-data";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";
import {
  agruparFrequenciaPorTurmaAnual,
  filtrarPorTexto,
} from "@/lib/professor-frequencia-escolar";

const BASE_PATH =
  "/gestor/consultas/sala-de-aula/frequencia-aluno/anual/turma";

export default async function GestorSalaDeAulaFrequenciaAnualTurmaPage({
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
          title="Turma por Ano %"
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
  const turmas = filtrarPorTexto(
    agruparFrequenciaPorTurmaAnual(resumos),
    params.q,
    ["turma", "serie", "turno", "disciplinas"],
  );

  return (
    <>
      <GestorPageHeader
        title="Turma por Ano %"
        description="Percentual de frequência anual consolidado por turma"
        actions={<BackLink />}
      />
      <FrequenciaAnualTurmaView
        turmas={turmas}
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
