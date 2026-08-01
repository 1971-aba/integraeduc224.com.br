import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";
import { createClient } from "@/lib/supabase/server";

const BASE_PATH =
  "/gestor/consultas/sala-de-aula/atualizar-dados/frequencia-turma";

export default async function GestorAtualizarDadosFrequenciaTurmaIndexPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getGestorEscolaId(profile);

  if (!escolaId) {
    redirect(
      `/gestor/em-breve?modulo=${encodeURIComponent("Atualizar Dados — Frequência Turma")}`,
    );
  }

  const supabase = await createClient();

  const { data: anoAtivo } = await supabase
    .from("anos_letivos")
    .select("id")
    .eq("ativo", true)
    .maybeSingle();

  let turmasQuery = supabase
    .from("turmas")
    .select("id")
    .eq("escola_id", escolaId)
    .order("serie")
    .limit(1);

  if (anoAtivo?.id) {
    turmasQuery = turmasQuery.eq("ano_letivo_id", anoAtivo.id);
  }

  const { data: turmas } = await turmasQuery;

  if (!turmas?.length) {
    redirect(
      `/gestor/em-breve?modulo=${encodeURIComponent("Atualizar Dados — Frequência Turma")}`,
    );
  }

  redirect(`${BASE_PATH}/${turmas[0].id}`);
}
