import Link from "next/link";
import { Plus, UserRound } from "lucide-react";
import { Suspense } from "react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { AlunosSearch } from "@/components/secretaria/alunos-search";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { MATRICULA_STATUS_LABEL } from "@/lib/secretaria-utils";
import { formatCpf } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function GestorAlunosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();

  const escolaId = profile.escola_id;

  let alunosQuery = supabase
    .from("alunos")
    .select("id, nome, cpf, data_nascimento, nome_mae, nis, created_at")
    .order("nome");

  if (profile.secretaria_id) {
    alunosQuery = alunosQuery.eq("secretaria_id", profile.secretaria_id);
  }

  if (q?.trim()) {
    alunosQuery = alunosQuery.ilike("nome", `%${q.trim()}%`);
  }

  const [{ data: alunos }, { data: turmas }] = await Promise.all([
    alunosQuery,
    escolaId
      ? supabase
          .from("turmas")
          .select("id, nome, serie")
          .eq("escola_id", escolaId)
      : supabase.from("turmas").select("id, nome, serie, escola_id"),
  ]);

  const turmaIds = turmas?.map((turma) => turma.id) ?? [];

  const { data: matriculas } = turmaIds.length
    ? await supabase
        .from("matriculas")
        .select("id, aluno_id, status, turma_id")
        .in("turma_id", turmaIds)
        .eq("status", "ativa")
    : { data: [] };

  const matriculaPorAluno = new Map(
    matriculas?.map((matricula) => [matricula.aluno_id, matricula]) ?? [],
  );

  const turmaPorId = new Map(turmas?.map((turma) => [turma.id, turma]) ?? []);

  return (
    <>
      <GestorPageHeader
        title="Alunos"
        description="Cadastro, matrícula e transferência de estudantes"
        actions={
          <Link href="/gestor/alunos/novo">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Novo aluno
            </Button>
          </Link>
        }
      />

      <div className="mb-6">
        <Suspense fallback={null}>
          <AlunosSearch />
        </Suspense>
      </div>

      <Card>
        <CardTitle>Estudantes cadastrados</CardTitle>
        <CardDescription>
          {alunos?.length ?? 0} aluno(s)
          {q ? ` encontrado(s) para "${q}"` : " na rede"}
        </CardDescription>

        <div className="mt-6 hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Nome</th>
                <th className="px-3 py-2 font-medium">CPF</th>
                <th className="px-3 py-2 font-medium">Turma</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {alunos?.map((aluno) => {
                const matricula = matriculaPorAluno.get(aluno.id);
                const turma = matricula
                  ? turmaPorId.get(matricula.turma_id)
                  : null;

                return (
                  <tr key={aluno.id} className="border-b border-slate-100">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <UserRound
                          className="h-4 w-4 text-slate-400"
                          aria-hidden="true"
                        />
                        <span className="font-medium text-slate-900">
                          {aluno.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {aluno.cpf ? formatCpf(aluno.cpf) : "—"}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {turma ? `${turma.nome} (${turma.serie})` : "Sem turma"}
                    </td>
                    <td className="px-3 py-3">
                      {matricula ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          {MATRICULA_STATUS_LABEL[matricula.status] ??
                            matricula.status}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          Não matriculado
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        href={`/gestor/alunos/${aluno.id}`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                );
              }) ?? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                    Nenhum aluno cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <ul className="mt-6 space-y-3 md:hidden">
          {alunos?.map((aluno) => {
            const matricula = matriculaPorAluno.get(aluno.id);
            const turma = matricula
              ? turmaPorId.get(matricula.turma_id)
              : null;

            return (
              <li
                key={aluno.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2">
                    <UserRound
                      className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-medium text-slate-900">{aluno.nome}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {aluno.cpf ? formatCpf(aluno.cpf) : "—"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {turma ? `${turma.nome} (${turma.serie})` : "Sem turma"}
                      </p>
                    </div>
                  </div>
                  {matricula ? (
                    <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      {MATRICULA_STATUS_LABEL[matricula.status] ??
                        matricula.status}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      Não matriculado
                    </span>
                  )}
                </div>
                <Link
                  href={`/gestor/alunos/${aluno.id}`}
                  className="mt-3 inline-block text-sm font-medium text-blue-700 hover:underline"
                >
                  Abrir ficha →
                </Link>
              </li>
            );
          }) ?? (
            <li className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
              Nenhum aluno cadastrado.
            </li>
          )}
        </ul>
      </Card>
    </>
  );
}
