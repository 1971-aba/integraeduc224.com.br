import Link from "next/link";
import { notFound } from "next/navigation";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { PlanoEditor } from "@/components/planos/plano-editor";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function PlanoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await requireRole(["professor"]);
  const supabase = await createClient();

  const { data: plano } = await supabase
    .from("planos_aula")
    .select(
      "id, tema, serie, disciplina, conteudo_ia, conteudo_final, professor_id",
    )
    .eq("id", id)
    .eq("professor_id", profile.id)
    .maybeSingle();

  if (!plano) notFound();

  return (
    <>
      <GestorPageHeader
        title="Editar Plano de Aula"
        description="Revise o conteúdo e exporte o PDF timbrado"
      />

      <Link
        href="/professor/planos"
        className="mb-4 inline-flex text-sm font-medium text-blue-700 hover:underline"
      >
        ← Voltar aos planos
      </Link>

      <PlanoEditor
        planoId={plano.id}
        tema={plano.tema}
        serie={plano.serie}
        disciplina={plano.disciplina}
        conteudoInicial={plano.conteudo_final ?? plano.conteudo_ia}
      />
    </>
  );
}
