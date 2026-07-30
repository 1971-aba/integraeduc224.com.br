import { DisciplinaForm } from "@/components/gestor/disciplina-form";
import { DisciplinaListItem } from "@/components/gestor/disciplina-list-item";
import { TurmaForm } from "@/components/gestor/turma-form";
import { TurmaListItem } from "@/components/gestor/turma-list-item";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import {
  getFallbackAnosLetivos,
  pickDefaultAnoLetivoId,
} from "@/lib/ano-letivo-session";
import { createClient } from "@/lib/supabase/server";

export default async function GestorTurmasPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();

  let turmasQuery = supabase
    .from("turmas")
    .select("id, nome, serie, turno, ano_letivo_id, escola_id")
    .order("serie")
    .order("nome");

  if (profile.role === "gestor_escolar" && profile.escola_id) {
    turmasQuery = turmasQuery.eq("escola_id", profile.escola_id);
  } else if (profile.secretaria_id) {
    const { data: escolasRede } = await supabase
      .from("escolas")
      .select("id")
      .eq("secretaria_id", profile.secretaria_id);

    turmasQuery = turmasQuery.in(
      "escola_id",
      escolasRede?.map((escola) => escola.id) ?? [],
    );
  }

  const disciplinasQuery = profile.secretaria_id
    ? supabase
        .from("disciplinas")
        .select("id, nome")
        .eq("secretaria_id", profile.secretaria_id)
        .order("nome")
    : supabase.from("disciplinas").select("id, nome").order("nome");

  const escolasQuery = profile.secretaria_id
    ? supabase
        .from("escolas")
        .select("id, nome")
        .eq("secretaria_id", profile.secretaria_id)
        .eq("ativa", true)
        .order("nome")
    : supabase
        .from("escolas")
        .select("id, nome")
        .eq("ativa", true)
        .order("nome");

  const [{ data: turmas }, { data: disciplinas }, { data: anosDb }, { data: escolas }] =
    await Promise.all([
      turmasQuery,
      disciplinasQuery,
      supabase.from("anos_letivos").select("id, ano, ativo").order("ano", {
        ascending: false,
      }),
      escolasQuery,
    ]);

  const anosLetivos =
    (anosDb ?? []).length > 0
      ? (anosDb ?? []).map((ano) => ({
          id: ano.id,
          label: `${ano.ano}${ano.ativo ? " (ativo)" : ""}`,
        }))
      : getFallbackAnosLetivos().map((ano) => ({
          id: ano.id,
          label: String(ano.ano),
        }));

  const defaultAnoLetivoId = pickDefaultAnoLetivoId(
    (anosDb ?? []).length > 0
      ? (anosDb ?? []).map((ano) => ({
          id: ano.id,
          ano: ano.ano,
          ativo: ano.ativo,
        }))
      : getFallbackAnosLetivos(),
  );

  const escolaNomes = new Map(
    (escolas ?? []).map((escola) => [escola.id, escola.nome]),
  );

  return (
    <>
      <GestorPageHeader
        title="Turmas e Disciplinas"
        description="Cadastre turmas da escola e disciplinas da rede para matrículas e atribuições docentes"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <TurmaForm
          anosLetivos={anosLetivos}
          defaultAnoLetivoId={defaultAnoLetivoId}
          defaultEscolaId={profile.escola_id ?? undefined}
          escolas={
            profile.role === "admin_sme"
              ? (escolas ?? []).map((escola) => ({
                  id: escola.id,
                  label: escola.nome,
                }))
              : []
          }
        />
        <DisciplinaForm />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Turmas cadastradas</CardTitle>
          <CardDescription>{turmas?.length ?? 0} turma(s)</CardDescription>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {turmas?.map((turma) => (
              <TurmaListItem
                key={turma.id}
                turma={turma}
                anosLetivos={anosLetivos}
                anoLabel={
                  String(
                    anosDb?.find((ano) => ano.id === turma.ano_letivo_id)?.ano,
                  ) || "—"
                }
                escolaLabel={
                  profile.role === "admin_sme" && turma.escola_id
                    ? escolaNomes.get(turma.escola_id)
                    : undefined
                }
              />
            )) ?? null}
            {(turmas ?? []).length === 0 ? (
              <p className="text-sm text-slate-500 sm:col-span-2">
                Nenhuma turma cadastrada. Use o formulário acima.
              </p>
            ) : null}
          </div>
        </Card>

        <Card>
          <CardTitle>Disciplinas da rede</CardTitle>
          <CardDescription>
            {disciplinas?.length ?? 0} disciplina(s)
          </CardDescription>

          <ul className="mt-6 space-y-2">
            {disciplinas?.map((disciplina) => (
              <DisciplinaListItem key={disciplina.id} disciplina={disciplina} />
            )) ?? null}
            {(disciplinas ?? []).length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhuma disciplina cadastrada. Use o formulário acima.
              </li>
            ) : null}
          </ul>
        </Card>
      </div>
    </>
  );
}
