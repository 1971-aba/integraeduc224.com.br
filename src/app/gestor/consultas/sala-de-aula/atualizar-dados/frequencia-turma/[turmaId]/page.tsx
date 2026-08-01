import { notFound, redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { formatTurmaAtualizarDadosLabel } from "@/lib/dashboard-utils";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";
import { createClient } from "@/lib/supabase/server";

export default async function GestorAtualizarDadosFrequenciaTurmaPage({
  params,
}: {
  params: Promise<{ turmaId: string }>;
}) {
  const { turmaId } = await params;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getGestorEscolaId(profile);

  if (!escolaId) {
    redirect(
      `/gestor/em-breve?modulo=${encodeURIComponent("Atualizar Dados — Frequência Turma")}`,
    );
  }

  const supabase = await createClient();

  const { data: turma } = await supabase
    .from("turmas")
    .select("id, serie, turno, nome, escola_id")
    .eq("id", turmaId)
    .maybeSingle();

  if (!turma || turma.escola_id !== escolaId) {
    notFound();
  }

  const label = formatTurmaAtualizarDadosLabel(
    turma.serie,
    turma.turno,
    turma.id,
    turma.nome,
  );

  redirect(
    `/gestor/em-breve?modulo=${encodeURIComponent(`Atualizar Dados — Frequência Turma — ${label}`)}`,
  );
}
