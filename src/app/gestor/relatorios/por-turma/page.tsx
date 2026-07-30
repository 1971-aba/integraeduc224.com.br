import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getRelatorioPorTurma } from "@/lib/gestor-relatorios";
import { formatCpf } from "@/lib/utils";

export default async function GestorRelatorioPorTurmaPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const turmas = await getRelatorioPorTurma(profile);

  const csvRows = turmas.flatMap((turma) =>
    turma.alunos.length > 0
      ? turma.alunos.map((aluno) => ({
          Escola: turma.escolaNome,
          Turma: turma.turmaNome,
          Serie: turma.serie,
          Turno: turma.turno,
          Aluno: aluno.nome,
          CPF: aluno.cpf ? formatCpf(aluno.cpf) : "",
        }))
      : [
          {
            Escola: turma.escolaNome,
            Turma: turma.turmaNome,
            Serie: turma.serie,
            Turno: turma.turno,
            Aluno: "—",
            CPF: "",
          },
        ],
  );

  return (
    <>
      <GestorPageHeader
        title="Alunos por Turma"
        description="Relação nominal de estudantes matriculados"
        actions={
          <div className="flex flex-wrap gap-2">
            <ExportarCsv rows={csvRows} filename="alunos-por-turma.csv" />
            <Link
              href="/gestor/relatorios"
              className="inline-flex h-11 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Relatórios
            </Link>
          </div>
        }
      />

      {turmas.length === 0 ? (
        <Card>
          <CardTitle>Nenhuma turma encontrada</CardTitle>
          <CardDescription>
            Cadastre turmas e matrículas para gerar este relatório.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-6">
          {turmas.map((turma) => (
            <Card key={turma.turmaId}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>
                    {turma.turmaNome} — {turma.serie}
                  </CardTitle>
                  <CardDescription>
                    {turma.turno}
                    {profile.role === "admin_sme"
                      ? ` • ${turma.escolaNome}`
                      : null}
                  </CardDescription>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                  {turma.totalAlunos} aluno(s)
                </span>
              </div>

              {turma.alunos.length > 0 ? (
                <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-slate-700">
                  {turma.alunos.map((aluno) => (
                    <li key={`${turma.turmaId}-${aluno.nome}`}>
                      {aluno.nome}
                      {aluno.cpf ? (
                        <span className="text-slate-500">
                          {" "}
                          — {formatCpf(aluno.cpf)}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ol>
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
