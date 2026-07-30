import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { CarteirinhasView } from "@/components/gestor/carteirinhas-view";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatTurnoLabel } from "@/lib/dashboard-utils";
import { createClient } from "@/lib/supabase/server";

function formatNascimento(data: string | null) {
  if (!data) return "—";
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
}

export default async function CarteirinhasPage({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string }>;
}) {
  const { turma: turmaId } = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();

  const escolaId = profile.escola_id;

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title="Imprimir Carteirinhas"
          description="Carteira do estudante por turma"
        />
        <Card>
          <CardTitle>Perfil sem escola vinculada</CardTitle>
          <CardDescription>
            As carteirinhas são emitidas por turma de uma unidade escolar.
          </CardDescription>
        </Card>
      </>
    );
  }

  const [{ data: escola }, { data: secretaria }, { data: turmas }] =
    await Promise.all([
      supabase.from("escolas").select("nome").eq("id", escolaId).maybeSingle(),
      profile.secretaria_id
        ? supabase
            .from("secretarias")
            .select("nome, municipio, uf")
            .eq("id", profile.secretaria_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("turmas")
        .select("id, nome, serie, turno, ano_letivo_id")
        .eq("escola_id", escolaId)
        .order("nome"),
    ]);

  const turmaSelecionada = turmaId
    ? turmas?.find((turma) => turma.id === turmaId)
    : null;

  const escolaNome = escola?.nome ?? "Unidade Escolar";
  const secretariaNome =
    secretaria?.nome ?? "Secretaria Municipal de Educação";
  const municipio = secretaria
    ? `${secretaria.municipio}-${secretaria.uf}`
    : "Município";

  if (!turmaSelecionada) {
    return (
      <>
        <GestorPageHeader
          title="Imprimir Carteirinhas"
          description="Selecione a turma para gerar as carteiras do estudante"
        />

        <Card>
          <CardTitle>Turmas da escola</CardTitle>
          <CardDescription>
            {turmas?.length ?? 0} turma(s) em {escolaNome}
          </CardDescription>

          {turmas?.length ? (
            <ul className="mt-4 space-y-2">
              {turmas.map((turma) => (
                <li key={turma.id}>
                  <Link
                    href={`/gestor/alunos/carteirinhas?turma=${turma.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-4 py-3 text-sm hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-900">
                      {turma.nome} — {turma.serie}
                    </span>
                    <span className="shrink-0 text-slate-600">
                      {formatTurnoLabel(turma.turno)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              Nenhuma turma cadastrada nesta escola.
            </p>
          )}
        </Card>
      </>
    );
  }

  const [{ data: matriculas }, { data: anoLetivo }] = await Promise.all([
    supabase
      .from("matriculas")
      .select("aluno_id")
      .eq("turma_id", turmaSelecionada.id)
      .eq("status", "ativa"),
    supabase
      .from("anos_letivos")
      .select("ano")
      .eq("id", turmaSelecionada.ano_letivo_id)
      .maybeSingle(),
  ]);

  const alunoIds = matriculas?.map((matricula) => matricula.aluno_id) ?? [];

  const { data: alunos } = alunoIds.length
    ? await supabase
        .from("alunos")
        .select("id, nome, data_nascimento, nome_mae")
        .in("id", alunoIds)
        .order("nome")
    : { data: [] };

  const turmaLabel = `${turmaSelecionada.nome} — ${turmaSelecionada.serie}`;

  return (
    <>
      <div className="print:hidden">
        <GestorPageHeader
          title="Imprimir Carteirinhas"
          description={`${turmaLabel} · ${formatTurnoLabel(
            turmaSelecionada.turno,
          )}`}
          actions={
            <Link
              href="/gestor/alunos/carteirinhas"
              className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Trocar turma
            </Link>
          }
        />
      </div>

      {alunos?.length ? (
        <CarteirinhasView
          escolaNome={escolaNome}
          secretariaNome={secretariaNome}
          municipio={municipio}
          turmaLabel={turmaLabel}
          turno={formatTurnoLabel(turmaSelecionada.turno)}
          anoLetivo={anoLetivo?.ano ?? null}
          alunos={alunos.map((aluno) => ({
            id: aluno.id,
            nome: aluno.nome,
            nascimento: formatNascimento(aluno.data_nascimento),
            responsavel: aluno.nome_mae ?? "—",
          }))}
        />
      ) : (
        <Card>
          <CardTitle>Nenhum aluno matriculado</CardTitle>
          <CardDescription>
            Matricule alunos em {turmaLabel} para emitir as carteirinhas.
          </CardDescription>
          <Link
            href="/gestor/turmas/formacao"
            className="mt-4 inline-flex h-10 items-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800"
          >
            Formação de turma
          </Link>
        </Card>
      )}
    </>
  );
}
