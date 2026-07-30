import { Suspense } from "react";
import { UserRound } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { AlunosSearch } from "@/components/secretaria/alunos-search";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import {
  getCoordenadorEscolaId,
  getEscolaTurmaIds,
} from "@/lib/coordenador-data";
import { MATRICULA_STATUS_LABEL } from "@/lib/secretaria-utils";
import { formatCpf } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function CoordenadorAlunosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { profile } = await requireRole(["coordenador", "admin_sme"]);
  const escolaId = getCoordenadorEscolaId(profile);

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title="Alunos da Escola"
          description="Consulta de estudantes matriculados na unidade"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const supabase = await createClient();
  const turmaIds = await getEscolaTurmaIds(supabase, escolaId);

  let alunosQuery = supabase
    .from("alunos")
    .select("id, nome, cpf, data_nascimento")
    .order("nome");

  if (profile.secretaria_id) {
    alunosQuery = alunosQuery.eq("secretaria_id", profile.secretaria_id);
  }

  if (q?.trim()) {
    alunosQuery = alunosQuery.ilike("nome", `%${q.trim()}%`);
  }

  const [{ data: alunos }, { data: turmas }, { data: matriculas }] =
    await Promise.all([
      alunosQuery,
      supabase
        .from("turmas")
        .select("id, nome, serie")
        .eq("escola_id", escolaId),
      turmaIds.length
        ? supabase
            .from("matriculas")
            .select("id, aluno_id, status, turma_id")
            .in("turma_id", turmaIds)
            .eq("status", "ativa")
        : Promise.resolve({ data: [] }),
    ]);

  const matriculaPorAluno = new Map(
    matriculas?.map((matricula) => [matricula.aluno_id, matricula]) ?? [],
  );
  const turmaPorId = new Map(turmas?.map((turma) => [turma.id, turma]) ?? []);

  const alunosEscola =
    alunos?.filter((aluno) => matriculaPorAluno.has(aluno.id)) ?? [];

  return (
    <>
      <GestorPageHeader
        title="Alunos da Escola"
        description="Consulta de estudantes matriculados na unidade"
      />

      <div className="mb-6">
        <Suspense fallback={null}>
          <AlunosSearch />
        </Suspense>
      </div>

      <Card>
        <CardTitle>Estudantes matriculados</CardTitle>
        <CardDescription>
          {alunosEscola.length} aluno(s)
          {q ? ` encontrado(s) para "${q}"` : " na escola"}
        </CardDescription>

        <div className="mt-6 hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Nome</th>
                <th className="px-3 py-2 font-medium">CPF</th>
                <th className="px-3 py-2 font-medium">Turma</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {alunosEscola.map((aluno) => {
                const matricula = matriculaPorAluno.get(aluno.id)!;
                const turma = turmaPorId.get(matricula.turma_id);

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
                      {turma ? `${turma.nome} (${turma.serie})` : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        {MATRICULA_STATUS_LABEL[matricula.status] ??
                          matricula.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {alunosEscola.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Nenhum aluno matriculado nesta escola.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <ul className="mt-6 space-y-3 md:hidden">
          {alunosEscola.map((aluno) => {
            const matricula = matriculaPorAluno.get(aluno.id)!;
            const turma = turmaPorId.get(matricula.turma_id);

            return (
              <li
                key={aluno.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-2">
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
                      {turma ? `${turma.nome} (${turma.serie})` : "—"}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
          {alunosEscola.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
              Nenhum aluno matriculado nesta escola.
            </li>
          ) : null}
        </ul>
      </Card>
    </>
  );
}
