import { notFound } from "next/navigation";

import { ConteudoForm } from "@/components/diario/conteudo-form";
import { requireRole } from "@/lib/auth";
import {
  getAtribuicaoForProfessor,
  validateDiaLetivo,
} from "@/lib/diario";
import { createClient } from "@/lib/supabase/server";

export default async function ConteudoPage({
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

  const [diaLetivo, conteudoExistente] = await Promise.all([
    validateDiaLetivo(data, atribuicao.ano_letivo_id),
    supabase
      .from("conteudos_diarios")
      .select("descricao")
      .eq("atribuicao_id", atribuicaoId)
      .eq("data", data)
      .maybeSingle(),
  ]);

  return (
    <ConteudoForm
      key={data}
      atribuicaoId={atribuicaoId}
      dataInicial={data}
      descricaoInicial={conteudoExistente.data?.descricao ?? ""}
      diaLetivo={diaLetivo}
    />
  );
}
