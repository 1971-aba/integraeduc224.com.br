import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { ProfessorTurmasGrid } from "@/components/professor/professor-turmas-grid";
import { requireRole } from "@/lib/auth";
import { CHAMADA_TIPOS } from "@/lib/chamada-tipos";
import {
  getEscolaAtribuicoes,
  mapEscolaAtribuicoesTurmas,
} from "@/lib/coordenador-data";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";
import { createClient } from "@/lib/supabase/server";

const BASE_PATH =
  "/gestor/consultas/sala-de-aula/frequencia-turma/realizar";

export default async function GestorSalaDeAulaRealizarFrequenciaPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getGestorEscolaId(profile);

  if (!escolaId) {
    return (
      <>
        <ProfessorTurmasGrid
          title="Realizar Frequência"
          description="Selecione a turma para registrar a chamada"
          turmas={[]}
          hrefForTurma={() => BASE_PATH}
        />
        <SemEscolaAlert />
      </>
    );
  }

  const supabase = await createClient();
  const atribuicoes = await getEscolaAtribuicoes(supabase, escolaId);
  const turmas = mapEscolaAtribuicoesTurmas(atribuicoes);

  return (
    <>
      <BackLink />
      <ProfessorTurmasGrid
        title="Realizar Frequência"
        description={CHAMADA_TIPOS.regular.descricao}
        turmas={turmas}
        hrefForTurma={(id) => `${BASE_PATH}/${id}`}
        actionLabel="Informar frequência"
      />
    </>
  );
}

function BackLink() {
  return (
    <Link
      href="/gestor/relatorios"
      className="mb-4 inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Relatórios
    </Link>
  );
}
