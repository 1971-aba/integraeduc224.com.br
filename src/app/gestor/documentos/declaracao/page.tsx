import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DeclaracaoMatricula } from "@/components/gestor/declaracao-matricula";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatCpf } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function GestorDeclaracaoPage({
  searchParams,
}: {
  searchParams: Promise<{ aluno?: string }>;
}) {
  const { aluno: alunoId } = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();

  let turmasQuery = supabase
    .from("turmas")
    .select("id, nome, serie, escola_id, ano_letivo_id")
    .order("nome");

  if (profile.role === "gestor_escolar" && profile.escola_id) {
    turmasQuery = turmasQuery.eq("escola_id", profile.escola_id);
  }

  const [{ data: alunos }, { data: turmas }] = await Promise.all([
    profile.secretaria_id
      ? supabase
          .from("alunos")
          .select("id, nome, cpf, nome_mae")
          .eq("secretaria_id", profile.secretaria_id)
          .order("nome")
      : supabase.from("alunos").select("id, nome, cpf, nome_mae").order("nome"),
    turmasQuery,
  ]);

  const turmaIds = turmas?.map((turma) => turma.id) ?? [];

  const { data: matriculas } = turmaIds.length
    ? await supabase
        .from("matriculas")
        .select("aluno_id, turma_id, ano_letivo_id, status")
        .in("turma_id", turmaIds)
        .eq("status", "ativa")
    : { data: [] };

  const matriculaPorAluno = new Map(
    matriculas?.map((matricula) => [matricula.aluno_id, matricula]) ?? [],
  );
  const turmaPorId = new Map(turmas?.map((turma) => [turma.id, turma]) ?? []);

  const alunosMatriculados =
    alunos?.filter((aluno) => matriculaPorAluno.has(aluno.id)) ?? [];

  const alunoSelecionado = alunoId
    ? alunosMatriculados.find((aluno) => aluno.id === alunoId)
    : null;

  let declaracaoData = null;

  if (alunoSelecionado) {
    const matricula = matriculaPorAluno.get(alunoSelecionado.id)!;
    const turma = turmaPorId.get(matricula.turma_id);
    const escolaId = turma?.escola_id ?? profile.escola_id;

    if (escolaId) {
      const [{ data: escola }, { data: secretaria }, { data: anoLetivo }] =
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
            .from("anos_letivos")
            .select("ano")
            .eq("id", matricula.ano_letivo_id)
            .maybeSingle(),
        ]);

      declaracaoData = {
      escolaNome: escola?.nome ?? "Unidade Escolar",
      secretariaNome: secretaria?.nome ?? "Secretaria Municipal de Educação",
      municipio: secretaria
        ? `${secretaria.municipio}-${secretaria.uf}`
        : "Município",
      alunoNome: alunoSelecionado.nome,
      alunoCpf: alunoSelecionado.cpf ? formatCpf(alunoSelecionado.cpf) : null,
      nomeMae: alunoSelecionado.nome_mae,
      turmaNome: turma?.nome ?? null,
      turmaSerie: turma?.serie ?? null,
      anoLetivo: anoLetivo?.ano ?? null,
      dataEmissao: new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    };
    }
  }

  return (
    <>
      <GestorPageHeader
        title="Declaração de Matrícula"
        description="Selecione o aluno para gerar o documento"
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
          <CardTitle>Alunos matriculados</CardTitle>
          <CardDescription>
            Selecione um estudante para emitir a declaração
          </CardDescription>
          <ul className="mt-4 space-y-2">
            {alunosMatriculados.map((aluno) => {
              const matricula = matriculaPorAluno.get(aluno.id)!;
              const turma = turmaPorId.get(matricula.turma_id);
              return (
                <li key={aluno.id}>
                  <Link
                    href={`/gestor/documentos/declaracao?aluno=${aluno.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 text-sm hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-900">
                      {aluno.nome}
                    </span>
                    <span className="text-slate-600">
                      {turma ? `${turma.nome} (${turma.serie})` : "—"}
                    </span>
                  </Link>
                </li>
              );
            })}
            {alunosMatriculados.length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhum aluno matriculado encontrado.
              </li>
            ) : null}
          </ul>
        </Card>
      ) : declaracaoData ? (
        <DeclaracaoMatricula {...declaracaoData} />
      ) : (
        <Card>
          <CardTitle>Não foi possível gerar a declaração</CardTitle>
          <CardDescription>
            Verifique se o gestor está vinculado à escola do aluno.
          </CardDescription>
        </Card>
      )}
    </>
  );
}
