import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  AutorizacaoDocumento,
  TIPOS_AUTORIZACAO,
} from "@/components/gestor/autorizacao-documento";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatCpf } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function GestorAutorizacaoPage({
  searchParams,
}: {
  searchParams: Promise<{
    aluno?: string;
    tipo?: string;
    responsavel?: string;
    data?: string;
    obs?: string;
  }>;
}) {
  const params = await searchParams;
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

  const alunoSelecionado = params.aluno
    ? alunosMatriculados.find((aluno) => aluno.id === params.aluno)
    : null;

  const tipo = params.tipo ?? "saida_antecipada";
  const responsavel =
    params.responsavel ?? alunoSelecionado?.nome_mae ?? "";
  const dataEvento =
    params.data ??
    new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  const observacao = params.obs ?? "";

  let documento = null;

  if (alunoSelecionado && params.tipo) {
    const matricula = matriculaPorAluno.get(alunoSelecionado.id)!;
    const turma = turmaPorId.get(matricula.turma_id);
    const escolaId = turma?.escola_id ?? profile.escola_id;

    if (escolaId) {
      const [{ data: escola }, { data: secretaria }] = await Promise.all([
        supabase.from("escolas").select("nome").eq("id", escolaId).maybeSingle(),
        profile.secretaria_id
          ? supabase
              .from("secretarias")
              .select("nome, municipio, uf")
              .eq("id", profile.secretaria_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      const turmaInfo = turma
        ? `${turma.nome} (${turma.serie})`
        : "turma não informada";

      documento = (
        <AutorizacaoDocumento
          tipo={tipo}
          escolaNome={escola?.nome ?? "Unidade Escolar"}
          secretariaNome={secretaria?.nome ?? "Secretaria Municipal de Educação"}
          municipio={
            secretaria
              ? `${secretaria.municipio}-${secretaria.uf}`
              : "Município"
          }
          alunoNome={alunoSelecionado.nome}
          alunoCpf={
            alunoSelecionado.cpf ? formatCpf(alunoSelecionado.cpf) : null
          }
          turmaInfo={turmaInfo}
          responsavel={responsavel}
          dataEvento={dataEvento}
          observacao={observacao}
        />
      );
    }
  }

  return (
    <>
      <GestorPageHeader
        title="Autorizações"
        description="Documentos de autorização para responsáveis"
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

      {!documento ? (
        <Card>
          <CardTitle>Emitir autorização</CardTitle>
          <CardDescription>
            Selecione o aluno, tipo e dados complementares
          </CardDescription>

          <form className="mt-6 space-y-4" method="get">
            <div>
              <label
                htmlFor="aluno"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Aluno
              </label>
              <select
                id="aluno"
                name="aluno"
                required
                defaultValue={params.aluno ?? ""}
                className="h-10 w-full max-w-md rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="">Selecione...</option>
                {alunosMatriculados.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="tipo"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Tipo de autorização
              </label>
              <select
                id="tipo"
                name="tipo"
                defaultValue={tipo}
                className="h-10 w-full max-w-md rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                {Object.entries(TIPOS_AUTORIZACAO).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="responsavel"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Responsável / acompanhante
              </label>
              <input
                id="responsavel"
                name="responsavel"
                type="text"
                defaultValue={responsavel}
                placeholder="Nome do responsável"
                className="h-10 w-full max-w-md rounded-md border border-slate-300 px-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="data"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Data do evento
              </label>
              <input
                id="data"
                name="data"
                type="text"
                defaultValue={dataEvento}
                placeholder="Ex.: 15 de março de 2026"
                className="h-10 w-full max-w-md rounded-md border border-slate-300 px-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="obs"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Observação (opcional)
              </label>
              <textarea
                id="obs"
                name="obs"
                rows={2}
                defaultValue={observacao}
                className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399]"
            >
              Gerar documento
            </button>
          </form>
        </Card>
      ) : (
        documento
      )}
    </>
  );
}
