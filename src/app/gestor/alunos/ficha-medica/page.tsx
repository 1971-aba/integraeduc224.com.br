import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FichaMedicaForm } from "@/components/gestor/ficha-medica-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCpf } from "@/lib/utils";

function formatData(data: string | null) {
  if (!data) return "—";
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
}

function formatAtualizacao(valor: string | null) {
  if (!valor) return null;
  return new Date(valor).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function FichaMedicaPage({
  searchParams,
}: {
  searchParams: Promise<{ aluno?: string }>;
}) {
  const { aluno: alunoId } = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();

  const escolaId = profile.escola_id;

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

  // Sem escola vinculada (admin da secretaria), a lista abrange a rede toda.
  const { data: alunos } = escolaId
    ? alunoIds.length
      ? await supabase
          .from("alunos")
          .select("id, nome, cpf, data_nascimento, nome_mae")
          .in("id", alunoIds)
          .order("nome")
      : { data: [] }
    : await supabase
        .from("alunos")
        .select("id, nome, cpf, data_nascimento, nome_mae")
        .eq("secretaria_id", profile.secretaria_id ?? "")
        .order("nome");

  const alunoSelecionado = alunoId
    ? alunos?.find((item) => item.id === alunoId)
    : null;

  const { data: ficha } = alunoSelecionado
    ? await supabase
        .from("fichas_medicas")
        .select("*")
        .eq("aluno_id", alunoSelecionado.id)
        .maybeSingle()
    : { data: null };

  const turmaDoAluno = alunoSelecionado
    ? turmaPorId.get(turmaPorAluno.get(alunoSelecionado.id) ?? "")
    : null;

  return (
    <>
      <GestorPageHeader
        title="Ficha de Informações Médicas"
        description={
          alunoSelecionado
            ? alunoSelecionado.nome
            : "Selecione o aluno para preencher a ficha"
        }
        actions={
          alunoSelecionado ? (
            <Link
              href="/gestor/alunos/ficha-medica"
              className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Trocar aluno
            </Link>
          ) : (
            <Link
              href="/gestor/alunos/ficha-medica/branco"
              className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
              Ficha em branco
            </Link>
          )
        }
      />

      {!alunoSelecionado ? (
        <Card>
          <CardTitle>Alunos</CardTitle>
          <CardDescription>
            {alunos?.length ?? 0} aluno(s) disponível(is)
            {escolaId ? " nesta escola" : " na rede"}
          </CardDescription>

          {alunos?.length ? (
            <ul className="mt-4 space-y-2">
              {alunos.map((item) => {
                const turma = turmaPorId.get(turmaPorAluno.get(item.id) ?? "");
                return (
                  <li key={item.id}>
                    <Link
                      href={`/gestor/alunos/ficha-medica?aluno=${item.id}`}
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
              Nenhum aluno matriculado encontrado. Matricule os alunos em
              Cadastros → Cadastro de Alunos.
            </p>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardTitle>Identificação</CardTitle>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <Dado rotulo="Aluno" valor={alunoSelecionado.nome} />
              <Dado
                rotulo="Turma"
                valor={
                  turmaDoAluno
                    ? `${turmaDoAluno.nome} (${turmaDoAluno.serie})`
                    : "Sem turma"
                }
              />
              <Dado
                rotulo="Nascimento"
                valor={formatData(alunoSelecionado.data_nascimento)}
              />
              <Dado
                rotulo="CPF"
                valor={
                  alunoSelecionado.cpf ? formatCpf(alunoSelecionado.cpf) : "—"
                }
              />
              <Dado
                rotulo="Mãe / responsável"
                valor={alunoSelecionado.nome_mae ?? "—"}
              />
            </dl>
          </Card>

          <Card>
            <CardTitle>Informações de saúde</CardTitle>
            <CardDescription>
              Dados usados em emergências, no preparo da merenda e no
              acompanhamento pedagógico
            </CardDescription>

            <div className="mt-6">
              <FichaMedicaForm
                alunoId={alunoSelecionado.id}
                atualizadaEm={formatAtualizacao(ficha?.updated_at ?? null)}
                valores={{
                  tipo_sanguineo: ficha?.tipo_sanguineo ?? "",
                  alergias: ficha?.alergias ?? "",
                  medicamentos: ficha?.medicamentos ?? "",
                  restricoes_alimentares: ficha?.restricoes_alimentares ?? "",
                  condicoes_saude: ficha?.condicoes_saude ?? "",
                  plano_saude: ficha?.plano_saude ?? "",
                  unidade_saude: ficha?.unidade_saude ?? "",
                  contato_nome: ficha?.contato_nome ?? "",
                  contato_telefone: ficha?.contato_telefone ?? "",
                  observacoes: ficha?.observacoes ?? "",
                }}
              />
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-slate-500">{rotulo}</dt>
      <dd className="mt-0.5 font-medium text-slate-900">{valor}</dd>
    </div>
  );
}
