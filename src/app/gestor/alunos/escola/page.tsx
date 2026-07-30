import Link from "next/link";
import { IdCard, UserRound } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatTurnoLabel } from "@/lib/dashboard-utils";
import { createClient } from "@/lib/supabase/server";
import { formatCpf } from "@/lib/utils";

type AlunoDaEscola = {
  id: string;
  nome: string;
  cpf: string | null;
  data_nascimento: string | null;
  nome_mae: string | null;
};

function formatNascimento(data: string | null) {
  if (!data) return "—";
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
}

export default async function AlunosDaEscolaPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();

  const escolaId = profile.escola_id;

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title="Alunos da Escola"
          description="Estudantes matriculados nesta unidade escolar"
        />
        <Card>
          <CardTitle>Perfil sem escola vinculada</CardTitle>
          <CardDescription>
            Esta tela lista os alunos de uma unidade escolar. Para ver todos os
            estudantes da rede, use Cadastros → Cadastro de Alunos → Alunos Rede
            Municipal.
          </CardDescription>
        </Card>
      </>
    );
  }

  const [{ data: escola }, { data: turmas }] = await Promise.all([
    supabase.from("escolas").select("nome").eq("id", escolaId).maybeSingle(),
    supabase
      .from("turmas")
      .select("id, nome, serie, turno")
      .eq("escola_id", escolaId)
      .order("nome"),
  ]);

  const turmaIds = turmas?.map((turma) => turma.id) ?? [];

  const { data: matriculas } = turmaIds.length
    ? await supabase
        .from("matriculas")
        .select("aluno_id, turma_id")
        .in("turma_id", turmaIds)
        .eq("status", "ativa")
    : { data: [] };

  const alunoIds = [
    ...new Set(matriculas?.map((matricula) => matricula.aluno_id) ?? []),
  ];

  const { data: alunos } = alunoIds.length
    ? await supabase
        .from("alunos")
        .select("id, nome, cpf, data_nascimento, nome_mae")
        .in("id", alunoIds)
        .order("nome")
    : { data: [] };

  const alunoPorId = new Map<string, AlunoDaEscola>(
    alunos?.map((aluno) => [aluno.id, aluno]) ?? [],
  );

  const alunosPorTurma = new Map<string, AlunoDaEscola[]>();
  for (const matricula of matriculas ?? []) {
    const aluno = alunoPorId.get(matricula.aluno_id);
    if (!aluno) continue;
    const lista = alunosPorTurma.get(matricula.turma_id) ?? [];
    lista.push(aluno);
    alunosPorTurma.set(matricula.turma_id, lista);
  }

  const turmasComAlunos = (turmas ?? []).map((turma) => ({
    ...turma,
    alunos: (alunosPorTurma.get(turma.id) ?? []).sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR"),
    ),
  }));

  return (
    <>
      <GestorPageHeader
        title="Alunos da Escola"
        description={`${alunoIds.length} aluno(s) matriculado(s) em ${
          turmas?.length ?? 0
        } turma(s)${escola?.nome ? ` — ${escola.nome}` : ""}`}
      />

      {turmasComAlunos.length === 0 ? (
        <Card>
          <CardTitle>Nenhuma turma cadastrada</CardTitle>
          <CardDescription>
            Cadastre as turmas em Cadastros → Turmas e Disciplinas → Turmas →
            Cadastro de Turmas para depois matricular os alunos.
          </CardDescription>
          <Link
            href="/gestor/turmas"
            className="mt-4 inline-flex h-10 items-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800"
          >
            Cadastrar turmas
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {turmasComAlunos.map((turma) => (
            <Card key={turma.id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>
                    {turma.nome} — {turma.serie}
                  </CardTitle>
                  <CardDescription>
                    {formatTurnoLabel(turma.turno)} · {turma.alunos.length}{" "}
                    aluno(s)
                  </CardDescription>
                </div>
                {turma.alunos.length > 0 ? (
                  <Link
                    href={`/gestor/alunos/carteirinhas?turma=${turma.id}`}
                    className="inline-flex h-10 shrink-0 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <IdCard className="mr-2 h-4 w-4" aria-hidden="true" />
                    Carteirinhas
                  </Link>
                ) : null}
              </div>

              {turma.alunos.length === 0 ? (
                <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  Nenhum aluno matriculado nesta turma.
                </p>
              ) : (
                <>
                  <div className="mt-4 hidden overflow-x-auto md:block">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="px-3 py-2 font-medium">Nome</th>
                          <th className="px-3 py-2 font-medium">CPF</th>
                          <th className="px-3 py-2 font-medium">Nascimento</th>
                          <th className="px-3 py-2 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {turma.alunos.map((aluno) => (
                          <tr
                            key={aluno.id}
                            className="border-b border-slate-100 last:border-b-0"
                          >
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
                              {formatNascimento(aluno.data_nascimento)}
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
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <ul className="mt-4 space-y-3 md:hidden">
                    {turma.alunos.map((aluno) => (
                      <li
                        key={aluno.id}
                        className="rounded-lg border border-slate-200 p-4"
                      >
                        <p className="font-medium text-slate-900">
                          {aluno.nome}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {aluno.cpf ? formatCpf(aluno.cpf) : "Sem CPF"} ·{" "}
                          {formatNascimento(aluno.data_nascimento)}
                        </p>
                        <Link
                          href={`/gestor/alunos/${aluno.id}`}
                          className="mt-2 inline-block text-sm font-medium text-blue-700 hover:underline"
                        >
                          Abrir ficha →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
