import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { HistoricoEscolarView } from "@/components/gestor/historico-escolar-view";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getHistoricoEscolar } from "@/lib/historico-escolar";
import { createClient } from "@/lib/supabase/server";

export default async function GestorHistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ aluno?: string }>;
}) {
  const { aluno: alunoId } = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();

  if (!profile.secretaria_id) {
    return (
      <>
        <GestorPageHeader title="Histórico Escolar" />
        <Card>
          <CardTitle>Secretaria não vinculada</CardTitle>
          <CardDescription>
            O perfil precisa estar vinculado a uma secretaria.
          </CardDescription>
        </Card>
      </>
    );
  }

  let alunosQuery = supabase
    .from("alunos")
    .select("id, nome")
    .eq("secretaria_id", profile.secretaria_id)
    .order("nome");

  const { data: alunos } = await alunosQuery;

  const alunoSelecionado = alunoId
    ? alunos?.find((aluno) => aluno.id === alunoId)
    : null;

  let historicoView = null;

  if (alunoSelecionado) {
    const historico = await getHistoricoEscolar(
      alunoSelecionado.id,
      profile.secretaria_id,
    );

    if (historico) {
      const matriculaAtiva = historico.matriculas.find(
        (m) => m.status === "ativa",
      );
      const escolaNome =
        matriculaAtiva?.escolaNome ??
        historico.matriculas[0]?.escolaNome ??
        "Unidade Escolar";

      const { data: secretaria } = await supabase
        .from("secretarias")
        .select("nome, municipio, uf")
        .eq("id", profile.secretaria_id)
        .maybeSingle();

      historicoView = (
        <HistoricoEscolarView
          historico={historico}
          escolaNome={escolaNome}
          secretariaNome={secretaria?.nome ?? "Secretaria Municipal de Educação"}
          municipio={
            secretaria
              ? `${secretaria.municipio}-${secretaria.uf}`
              : "Município"
          }
        />
      );
    }
  }

  return (
    <>
      <GestorPageHeader
        title="Histórico Escolar"
        description="Consulta de matrículas e rendimento do estudante"
        actions={
          <Link
            href="/gestor/documentos"
            className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Documentos
          </Link>
        }
      />

      {!alunoSelecionado ? (
        <Card>
          <CardTitle>Alunos cadastrados</CardTitle>
          <CardDescription>
            Selecione um estudante para visualizar o histórico
          </CardDescription>
          <ul className="mt-4 max-h-[480px] space-y-2 overflow-y-auto">
            {alunos?.map((aluno) => (
              <li key={aluno.id}>
                <Link
                  href={`/gestor/documentos/historico?aluno=${aluno.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 text-sm hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-900">{aluno.nome}</span>
                </Link>
              </li>
            ))}
            {!alunos?.length ? (
              <li className="text-sm text-slate-500">
                Nenhum aluno cadastrado.
              </li>
            ) : null}
          </ul>
        </Card>
      ) : historicoView ? (
        historicoView
      ) : (
        <Card>
          <CardTitle>Histórico indisponível</CardTitle>
          <CardDescription>
            Não foi possível carregar os dados do aluno selecionado.
          </CardDescription>
        </Card>
      )}
    </>
  );
}
