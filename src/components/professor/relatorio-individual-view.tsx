"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { RelatorioIndividualAluno } from "@/lib/professor-relatorio-individual";

type RelatorioIndividualViewProps = {
  relatorio: RelatorioIndividualAluno;
  escolaNome: string;
};

function formatNota(value: number | null) {
  if (value === null) return "—";
  return value.toFixed(1).replace(".", ",");
}

export function RelatorioIndividualView({
  relatorio,
  escolaNome,
}: RelatorioIndividualViewProps) {
  const dataEmissao = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end print:hidden">
        <Button type="button" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
          Imprimir
        </Button>
      </div>

      <article className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none">
        <header className="border-b border-slate-200 pb-6 text-center">
          <h1 className="text-xl font-bold uppercase text-slate-900">
            {escolaNome}
          </h1>
          <p className="mt-4 text-lg font-semibold text-slate-900">
            RELATÓRIO INDIVIDUAL DO ESTUDANTE
          </p>
        </header>

        <section className="mt-6 space-y-2 text-sm text-slate-800">
          <p>
            <strong>Aluno(a):</strong> {relatorio.alunoNome}
          </p>
          <p>
            <strong>Turma:</strong> {relatorio.turma} ({relatorio.serie})
          </p>
          <p>
            <strong>Disciplina:</strong> {relatorio.disciplina}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-700">
            Rendimento
          </h2>
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                {relatorio.bimestres.map((bimestre) => (
                  <th key={bimestre.id} className="px-2 py-2 font-medium">
                    {bimestre.numero}º B
                  </th>
                ))}
                <th className="py-2 pl-2 font-medium">Média</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {relatorio.bimestres.map((bimestre) => (
                  <td key={bimestre.id} className="px-2 py-2 text-center">
                    {formatNota(
                      relatorio.mediasPorBimestre[bimestre.numero] ?? null,
                    )}
                  </td>
                ))}
                <td className="py-2 pl-2 font-semibold">
                  {formatNota(relatorio.mediaAnual)}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-700">
            Frequência na disciplina
          </h2>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            <li>Aulas registradas: {relatorio.frequencia.totalAulas}</li>
            <li>Presenças: {relatorio.frequencia.presentes}</li>
            <li>Faltas: {relatorio.frequencia.faltas}</li>
            <li>Justificadas: {relatorio.frequencia.justificadas}</li>
            <li className="sm:col-span-2 font-semibold">
              Percentual de presença:{" "}
              {relatorio.frequencia.percentualPresenca.toFixed(1).replace(".", ",")}%
            </li>
          </ul>
        </section>

        <p className="mt-10 text-right text-sm text-slate-700">{dataEmissao}</p>
      </article>
    </div>
  );
}
