import { notFound } from "next/navigation";

import { ChamadaForm } from "@/components/diario/chamada-form";
import { requireRole } from "@/lib/auth";
import {
  getAtribuicaoForProfessor,
  getMatriculasAtivas,
  validateDiaLetivo,
} from "@/lib/diario";
import type { PresencaStatus } from "@/lib/diario-utils";
import { createClient } from "@/lib/supabase/server";

export default async function ChamadaPage({
  params,
  searchParams,
}: {
  params: Promise<{ atribuicaoId: string }>;
  searchParams: Promise<{ data?: string }>;
}) {
  const { atribuicaoId } = await params;
  const { data: dataParam } = await searchParams;
  const { profile } = await requireRole(["professor"]);

  const atribuicao = await getAtribuicaoForProfessor(
    atribuicaoId,
    profile.id,
  );
  if (!atribuicao) notFound();

  const data =
    dataParam ?? new Date().toISOString().slice(0, 10);
  const supabase = await createClient();

  const [matriculas, diaLetivo, chamadaExistente] = await Promise.all([
    getMatriculasAtivas(atribuicao.turma_id),
    validateDiaLetivo(data, atribuicao.ano_letivo_id),
    supabase
      .from("chamadas")
      .select("id")
      .eq("atribuicao_id", atribuicaoId)
      .eq("data", data)
      .eq("tipo", "regular")
      .maybeSingle(),
  ]);

  const { data: frequencias } = chamadaExistente.data
    ? await supabase
        .from("registros_frequencia")
        .select("matricula_id, status")
        .eq("chamada_id", chamadaExistente.data.id)
    : { data: [] as Array<{ matricula_id: string; status: PresencaStatus }> };

  const alunos = matriculas.map((matricula) => {
    const registro = (frequencias ?? []).find(
      (item) => item.matricula_id === matricula.id,
    );
    return {
      matriculaId: matricula.id,
      nome: matricula.alunos?.nome ?? "Aluno",
      status: (registro?.status ?? "presente") as PresencaStatus,
    };
  });

  return (
    <ChamadaForm
      key={data}
      atribuicaoId={atribuicaoId}
      dataInicial={data}
      alunos={alunos}
      diaLetivo={diaLetivo}
    />
  );
}
