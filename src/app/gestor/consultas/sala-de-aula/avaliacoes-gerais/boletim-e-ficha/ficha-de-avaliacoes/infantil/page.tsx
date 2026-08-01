import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FichaNotasProfessorView } from "@/components/professor/ficha-notas-professor-view";
import { requireRole } from "@/lib/auth";
import { loadFichaAvaliacoesEscola } from "@/lib/gestor-boletim";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";

export default async function GestorSalaDeAulaFichaDeAvaliacoesInfantilPage({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string; bimestre?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getGestorEscolaId(profile);

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title="Ficha de Avaliações — Educação Infantil"
          description="Notas consolidadas por turma e aluno"
          actions={<BackLink />}
        />
        <SemEscolaAlert />
      </>
    );
  }

  const { turmas, turmaId, boletim } = await loadFichaAvaliacoesEscola(
    escolaId,
    "infantil",
    params,
  );

  return (
    <>
      <GestorPageHeader
        title="Ficha de Avaliações — Educação Infantil"
        description="Consulta de notas das turmas da educação infantil"
        actions={<BackLink />}
      />
      <FichaNotasProfessorView
        titulo="Educação Infantil"
        descricao="Selecione uma turma da educação infantil para visualizar a ficha."
        turmas={turmas}
        turmaId={turmaId}
        bimestreId={params.bimestre}
        boletim={boletim}
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
