"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatTurnoLabel } from "@/lib/dashboard-utils";
import type { BoletimTurmaData } from "@/lib/boletim";

type BoletimIndividualViewProps = {
  boletim: BoletimTurmaData;
  matriculaId: string;
  bimestreId?: string;
  escolaNome: string;
  modo?: "completo" | "resumido";
};

function formatNota(value: number | null) {
  if (value === null) return "—";
  return value.toFixed(1).replace(".", ",");
}

function notaTone(value: number | null) {
  if (value === null) return "text-slate-400";
  if (value >= 6) return "text-green-700 font-semibold";
  if (value >= 5) return "text-amber-700 font-semibold";
  return "text-red-700 font-semibold";
}

export function BoletimIndividualView({
  boletim,
  matriculaId,
  bimestreId,
  escolaNome,
  modo = "completo",
}: BoletimIndividualViewProps) {
  const aluno = boletim.alunos.find((item) => item.matriculaId === matriculaId);
  const bimestreNumero =
    boletim.bimestres.find((b) => b.id === bimestreId)?.numero ??
    boletim.bimestres.at(-1)?.numero;

  const dataEmissao = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  if (!aluno) {
    return (
      <Card>
        <CardTitle>Aluno não encontrado</CardTitle>
        <CardDescription>
          Selecione um estudante matriculado na turma escolhida.
        </CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end print:hidden">
        <Button type="button" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
          Imprimir boletim
        </Button>
      </div>

      <article className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none">
        <header className="border-b border-slate-200 pb-6 text-center">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {escolaNome}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            {modo === "resumido" ? "Boletim Resumido" : "Boletim Completo"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {boletim.turma.nome} — {boletim.turma.serie} •{" "}
            {formatTurnoLabel(boletim.turma.turno)}
            {bimestreNumero ? ` • ${bimestreNumero}º bimestre` : null}
          </p>
        </header>

        <section className="mt-6">
          <h3 className="text-lg font-semibold text-slate-900">{aluno.nome}</h3>
          <p className="text-sm text-slate-600">Emitido em {dataEmissao}</p>
        </section>

        <section className="mt-8">
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#1E7BB8]">
            Desempenho por disciplina
          </h4>
          {boletim.disciplinas.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhuma disciplina com notas lançadas para esta turma.
            </p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-2 text-left font-medium">Disciplina</th>
                  {modo === "completo" ? (
                    <th className="py-2 text-left font-medium">Professor</th>
                  ) : null}
                  <th className="py-2 text-right font-medium">Nota / Média</th>
                </tr>
              </thead>
              <tbody>
                {boletim.disciplinas.map((disciplina) => {
                  const media =
                    aluno.mediasPorDisciplina[disciplina.atribuicaoId] ?? null;
                  return (
                    <tr
                      key={disciplina.atribuicaoId}
                      className="border-b border-slate-100"
                    >
                      <td className="py-3 font-medium text-slate-900">
                        {disciplina.disciplina}
                      </td>
                      {modo === "completo" ? (
                        <td className="py-3 text-slate-600">
                          {disciplina.professor}
                        </td>
                      ) : null}
                      <td className={`py-3 text-right ${notaTone(media)}`}>
                        {formatNota(media)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200">
                  <td
                    colSpan={modo === "completo" ? 2 : 1}
                    className="py-3 font-semibold text-slate-900"
                  >
                    Média geral
                  </td>
                  <td
                    className={`py-3 text-right font-semibold ${notaTone(aluno.mediaGeral)}`}
                  >
                    {formatNota(aluno.mediaGeral)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </section>
      </article>
    </div>
  );
}
