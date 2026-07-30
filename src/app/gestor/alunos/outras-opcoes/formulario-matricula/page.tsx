import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FormularioMatricula } from "@/components/gestor/formulario-matricula";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCpf } from "@/lib/utils";

function formatNascimento(data: string | null) {
  if (!data) return null;
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
}

export default async function FormularioMatriculaPage({
  searchParams,
}: {
  searchParams: Promise<{ aluno?: string; branco?: string }>;
}) {
  const { aluno: alunoId, branco } = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();

  const escolaId = profile.escola_id;

  const [{ data: escola }, { data: secretaria }, { data: anoLetivo }] =
    await Promise.all([
      escolaId
        ? supabase
            .from("escolas")
            .select("nome")
            .eq("id", escolaId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
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
        .eq("ativo", true)
        .maybeSingle(),
    ]);

  const { data: turmas } = escolaId
    ? await supabase
        .from("turmas")
        .select("id, nome, serie")
        .eq("escola_id", escolaId)
    : { data: [] };

  const turmaIds = turmas?.map((turma) => turma.id) ?? [];

  const { data: matriculas } = turmaIds.length
    ? await supabase
        .from("matriculas")
        .select("aluno_id, turma_id")
        .in("turma_id", turmaIds)
        .eq("status", "ativa")
    : { data: [] };

  const turmaPorAluno = new Map(
    matriculas?.map((matricula) => [matricula.aluno_id, matricula.turma_id]) ??
      [],
  );
  const turmaPorId = new Map(turmas?.map((turma) => [turma.id, turma]) ?? []);
  const alunoIds = [...turmaPorAluno.keys()];

  const { data: alunos } = alunoIds.length
    ? await supabase
        .from("alunos")
        .select("id, nome, cpf, nis, data_nascimento, nome_mae")
        .in("id", alunoIds)
        .order("nome")
    : { data: [] };

  const alunoSelecionado = alunoId
    ? alunos?.find((item) => item.id === alunoId)
    : null;

  const escolaNome = escola?.nome ?? "Unidade Escolar";
  const secretariaNome = secretaria?.nome ?? "Secretaria Municipal de Educação";
  const municipio = secretaria
    ? `${secretaria.municipio}-${secretaria.uf}`
    : "Município";

  const mostrarFormulario = Boolean(alunoSelecionado) || branco === "1";

  if (!mostrarFormulario) {
    return (
      <>
        <GestorPageHeader
          title="Formulário de Matrícula"
          description="Imprima em branco para o responsável preencher ou pré-preenchido com os dados já cadastrados"
          actions={
            <Link
              href="/gestor/alunos/outras-opcoes/formulario-matricula?branco=1"
              className="inline-flex h-10 items-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800"
            >
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
              Formulário em branco
            </Link>
          }
        />

        <Card>
          <CardTitle>Pré-preencher com um aluno já cadastrado</CardTitle>
          <CardDescription>
            {alunos?.length ?? 0} aluno(s) matriculado(s) em {escolaNome}
          </CardDescription>

          {alunos?.length ? (
            <ul className="mt-4 space-y-2">
              {alunos.map((item) => {
                const turma = turmaPorId.get(turmaPorAluno.get(item.id) ?? "");
                return (
                  <li key={item.id}>
                    <Link
                      href={`/gestor/alunos/outras-opcoes/formulario-matricula?aluno=${item.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-4 py-3 text-sm hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-900">
                        {item.nome}
                      </span>
                      <span className="shrink-0 text-slate-600">
                        {turma ? `${turma.nome} (${turma.serie})` : "Sem turma"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              Nenhum aluno matriculado. Use o formulário em branco para a
              matrícula presencial.
            </p>
          )}
        </Card>
      </>
    );
  }

  const turmaDoAluno = alunoSelecionado
    ? turmaPorId.get(turmaPorAluno.get(alunoSelecionado.id) ?? "")
    : null;

  return (
    <>
      <div className="print:hidden">
        <GestorPageHeader
          title="Formulário de Matrícula"
          description={alunoSelecionado?.nome ?? "Formulário em branco"}
          actions={
            <Link
              href="/gestor/alunos/outras-opcoes/formulario-matricula"
              className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Voltar
            </Link>
          }
        />
      </div>

      <FormularioMatricula
        escolaNome={escolaNome}
        secretariaNome={secretariaNome}
        municipio={municipio}
        anoLetivo={anoLetivo?.ano ?? null}
        aluno={
          alunoSelecionado
            ? {
                nome: alunoSelecionado.nome,
                nascimento: formatNascimento(alunoSelecionado.data_nascimento),
                cpf: alunoSelecionado.cpf
                  ? formatCpf(alunoSelecionado.cpf)
                  : null,
                nis: alunoSelecionado.nis,
                nomeMae: alunoSelecionado.nome_mae,
                turma: turmaDoAluno
                  ? `${turmaDoAluno.nome} (${turmaDoAluno.serie})`
                  : null,
              }
            : null
        }
      />
    </>
  );
}
