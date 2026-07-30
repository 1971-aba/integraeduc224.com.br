import { AtribuicaoForm } from "@/components/gestor/atribuicao-form";
import { AtribuicaoListItem } from "@/components/gestor/atribuicao-list-item";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function GestorAtribuicoesPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();

  const professoresQuery = supabase
    .from("profiles")
    .select("id, nome")
    .eq("role", "professor")
    .eq("ativo", true)
    .order("nome");

  if (profile.role === "gestor_escolar") {
    professoresQuery.eq("escola_id", profile.escola_id!);
  } else {
    professoresQuery.eq("secretaria_id", profile.secretaria_id!);
  }

  let turmasQuery = supabase
    .from("turmas")
    .select("id, nome, serie, turno, escola_id")
    .order("nome");

  if (profile.role === "gestor_escolar") {
    turmasQuery = turmasQuery.eq("escola_id", profile.escola_id!);
  } else {
    const { data: escolas } = await supabase
      .from("escolas")
      .select("id")
      .eq("secretaria_id", profile.secretaria_id!);

    turmasQuery = turmasQuery.in(
      "escola_id",
      escolas?.map((escola) => escola.id) ?? [],
    );
  }

  const [
    { data: professores },
    { data: disciplinas },
    { data: turmas },
    { data: anoAtivo },
    { data: atribuicoesRaw },
    { data: turmasLookup },
    { data: disciplinasLookup },
    { data: professoresLookup },
  ] = await Promise.all([
    professoresQuery,
    supabase.from("disciplinas").select("id, nome").order("nome"),
    turmasQuery,
    supabase.from("anos_letivos").select("id, ano").eq("ativo", true).maybeSingle(),
    supabase
      .from("atribuicoes_docentes")
      .select("id, professor_id, disciplina_id, turma_id")
      .order("created_at", { ascending: false }),
    supabase.from("turmas").select("id, nome, serie, escola_id"),
    supabase.from("disciplinas").select("id, nome"),
    supabase.from("profiles").select("id, nome"),
  ]);

  const atribuicoes =
    atribuicoesRaw
      ?.filter((item) => {
        if (profile.role !== "gestor_escolar") return true;
        const turma = turmasLookup?.find((t) => t.id === item.turma_id);
        return turma?.escola_id === profile.escola_id;
      })
      .map((item) => ({
        id: item.id,
        professor: professoresLookup?.find((p) => p.id === item.professor_id),
        disciplina: disciplinasLookup?.find(
          (d) => d.id === item.disciplina_id,
        ),
        turma: turmasLookup?.find((t) => t.id === item.turma_id),
      })) ?? [];

  return (
    <>
      <GestorPageHeader
        title="Atribuições docentes"
        description="Vincule professores às disciplinas e turmas"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {anoAtivo ? (
          <AtribuicaoForm
            professores={(professores ?? []).map((p) => ({
              id: p.id,
              label: p.nome,
            }))}
            disciplinas={(disciplinas ?? []).map((d) => ({
              id: d.id,
              label: d.nome,
            }))}
            turmas={(turmas ?? []).map((t) => ({
              id: t.id,
              label: `${t.nome} — ${t.serie} (${t.turno})`,
            }))}
            anoLetivoId={anoAtivo.id}
          />
        ) : (
          <Card>
            <CardTitle>Ano letivo não configurado</CardTitle>
            <CardDescription>
              Solicite ao administrador SME a ativação do calendário letivo.
            </CardDescription>
          </Card>
        )}

        <Card>
          <CardTitle>Atribuições atuais</CardTitle>
          <CardDescription>
            {atribuicoes.length} vínculo(s) cadastrado(s)
          </CardDescription>

          <ul className="mt-6 space-y-3">
            {atribuicoes.map((item) => (
              <AtribuicaoListItem
                key={item.id}
                atribuicao={{
                  id: item.id,
                  professorNome: item.professor?.nome ?? "Professor",
                  disciplinaNome: item.disciplina?.nome ?? "Disciplina",
                  turmaNome: item.turma?.nome ?? "Turma",
                  turmaSerie: item.turma?.serie ?? "—",
                }}
              />
            ))}
            {atribuicoes.length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhuma atribuição cadastrada.
              </li>
            ) : null}
          </ul>
        </Card>
      </div>
    </>
  );
}
