import { notFound } from "next/navigation";

import { NotasForm } from "@/components/diario/notas-form";
import { requireRole } from "@/lib/auth";
import {
  getAtribuicaoForProfessor,
  getBimestres,
  getMatriculasAtivas,
} from "@/lib/diario";
import { createClient } from "@/lib/supabase/server";

export default async function NotasPage({
  params,
}: {
  params: Promise<{ atribuicaoId: string }>;
}) {
  const { atribuicaoId } = await params;
  const { profile } = await requireRole(["professor"]);

  const atribuicao = await getAtribuicaoForProfessor(
    atribuicaoId,
    profile.id,
  );
  if (!atribuicao) notFound();

  const supabase = await createClient();

  const [matriculas, bimestres, notasSalvas] = await Promise.all([
    getMatriculasAtivas(atribuicao.turma_id),
    getBimestres(atribuicao.ano_letivo_id),
    supabase
      .from("notas")
      .select("matricula_id, bimestre_id, nota, recuperacao, media_bimestre")
      .eq("atribuicao_id", atribuicaoId),
  ]);

  if (bimestres.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Nenhum bimestre cadastrado para este ano letivo.
      </p>
    );
  }

  const alunos = matriculas.map((matricula) => {
    const notasPorBimestre: Record<
      string,
      {
        nota: number | null;
        recuperacao: number | null;
        media: number | null;
      }
    > = {};

    for (const bimestre of bimestres) {
      const registro = notasSalvas.data?.find(
        (item) =>
          item.matricula_id === matricula.id &&
          item.bimestre_id === bimestre.id,
      );
      notasPorBimestre[bimestre.id] = {
        nota: registro?.nota ?? null,
        recuperacao: registro?.recuperacao ?? null,
        media: registro?.media_bimestre ?? null,
      };
    }

    return {
      matriculaId: matricula.id,
      nome: matricula.alunos?.nome ?? "Aluno",
      notas: notasPorBimestre,
    };
  });

  return (
    <NotasForm
      atribuicaoId={atribuicaoId}
      bimestres={bimestres}
      alunos={alunos}
      bimestreInicialId={bimestres[0].id}
    />
  );
}
