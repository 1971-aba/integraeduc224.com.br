import Link from "next/link";
import { IdCard, UserRound } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { requireRole } from "@/lib/auth";
import {
  isSerieEnsinoMedio,
  SERIES_ENSINO_MEDIO,
} from "@/lib/alunos-escolares-config";
import { formatTurnoLabel } from "@/lib/dashboard-utils";
import { createClient } from "@/lib/supabase/server";
import { formatCpf } from "@/lib/utils";

type AlunoMedio = {
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

export default async function AlunosEnsinoMedioPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader
          title="Alunos Ensino Médio"
          description="Estudantes matriculados nas turmas do Ensino Médio"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const supabase = await createClient();

  const [{ data: escola }, { data: turmas }] = await Promise.all([
    supabase
      .from("escolas")
      .select("nome")
      .eq("id", profile.escola_id)
      .maybeSingle(),
    supabase
      .from("turmas")
      .select("id, nome, serie, turno")
      .eq("escola_id", profile.escola_id)
      .order("nome"),
  ]);

  const turmasMedio = (turmas ?? []).filter((turma) =>
    isSerieEnsinoMedio(turma.serie),
  );
  const turmaIds = turmasMedio.map((turma) => turma.id);

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

  const alunoPorId = new Map<string, AlunoMedio>(
    alunos?.map((aluno) => [aluno.id, aluno]) ?? [],
  );

  const alunosPorTurma = new Map<string, AlunoMedio[]>();
  for (const matricula of matriculas ?? []) {
    const aluno = alunoPorId.get(matricula.aluno_id);
    if (!aluno) continue;
    const lista = alunosPorTurma.get(matricula.turma_id) ?? [];
    lista.push(aluno);
    alunosPorTurma.set(matricula.turma_id, lista);
  }

  const turmasComAlunos = turmasMedio.map((turma) => ({
    ...turma,
    alunos: (alunosPorTurma.get(turma.id) ?? []).sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR"),
    ),
  }));

  const linhasCsv = turmasComAlunos.flatMap((turma) =>
    turma.alunos.map((aluno) => ({
      Aluno: aluno.nome,
      Turma: turma.nome,
      Serie: turma.serie,
      Turno: formatTurnoLabel(turma.turno),
      CPF: aluno.cpf ? formatCpf(aluno.cpf) : "",
      Responsavel: aluno.nome_mae ?? "",
    })),
  );

  return (
    <>
      <GestorPageHeader
        title="Alunos Ensino Médio"
        description={`${alunoIds.length} estudante(s) em ${turmasMedio.length} turma(s) · ${
          escola?.nome ?? "Unidade Escolar"
        }`}
        actions={
          <ExportarCsv
            rows={linhasCsv}
            filename="alunos-ensino-medio.csv"
            label={`Exportar CSV (${linhasCsv.length})`}
          />
        }
      />

      {turmasMedio.length === 0 ? (
        <Card>
          <CardTitle>Nenhuma turma do Ensino Médio</CardTitle>
          <CardDescription>
            Cadastre turmas com as séries{" "}
            {SERIES_ENSINO_MEDIO.map((serie) => `"${serie}"`).join(", ")} em
            Turmas e Disciplinas.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-6">
          {turmasComAlunos.map((turma) => (
            <Card key={turma.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>
                    {turma.nome} — {turma.serie}
                  </CardTitle>
                  <CardDescription>
                    {formatTurnoLabel(turma.turno)} · {turma.alunos.length}{" "}
                    aluno(s)
                  </CardDescription>
                </div>
                <Link
                  href={`/gestor/alunos/carteirinhas?turma=${turma.id}`}
                  className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <IdCard className="mr-2 h-4 w-4" aria-hidden="true" />
                  Carteirinhas
                </Link>
              </div>

              {turma.alunos.length > 0 ? (
                <ul className="mt-4 divide-y divide-slate-100">
                  {turma.alunos.map((aluno) => (
                    <li
                      key={aluno.id}
                      className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                          <UserRound
                            className="h-4 w-4 text-slate-500"
                            aria-hidden="true"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/gestor/alunos/${aluno.id}`}
                            className="font-medium text-slate-900 hover:underline"
                          >
                            {aluno.nome}
                          </Link>
                          <p className="text-sm text-slate-600">
                            Nasc.: {formatNascimento(aluno.data_nascimento)}
                            {aluno.cpf
                              ? ` · CPF ${formatCpf(aluno.cpf)}`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 sm:text-right">
                        {aluno.nome_mae ?? "Responsável não informado"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  Nenhum aluno matriculado nesta turma.
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
