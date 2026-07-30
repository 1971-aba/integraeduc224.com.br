"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MATRICULA_STATUS_LABEL } from "@/lib/secretaria-utils";
import type { HistoricoEscolarData } from "@/lib/historico-escolar";
import { formatCpf } from "@/lib/utils";

type HistoricoEscolarViewProps = {
  historico: HistoricoEscolarData;
  escolaNome: string;
  secretariaNome: string;
  municipio: string;
};

function formatNota(value: number | null) {
  if (value === null) return "—";
  return value.toFixed(1).replace(".", ",");
}

export function HistoricoEscolarView({
  historico,
  escolaNome,
  secretariaNome,
  municipio,
}: HistoricoEscolarViewProps) {
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

      <article className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none">
        <header className="border-b border-slate-200 pb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            {secretariaNome}
          </p>
          <p className="mt-1 text-sm text-slate-600">{municipio}</p>
          <h1 className="mt-4 text-xl font-bold uppercase text-slate-900">
            {escolaNome}
          </h1>
          <p className="mt-6 text-lg font-semibold text-slate-900">
            HISTÓRICO ESCOLAR
          </p>
        </header>

        <section className="mt-6 space-y-2 text-sm text-slate-800">
          <p>
            <strong>Aluno(a):</strong> {historico.aluno.nome}
          </p>
          {historico.aluno.cpf ? (
            <p>
              <strong>CPF:</strong> {formatCpf(historico.aluno.cpf)}
            </p>
          ) : null}
          {historico.aluno.dataNascimento ? (
            <p>
              <strong>Data de nascimento:</strong>{" "}
              {new Date(
                `${historico.aluno.dataNascimento}T12:00:00`,
              ).toLocaleDateString("pt-BR")}
            </p>
          ) : null}
          {historico.aluno.nomeMae ? (
            <p>
              <strong>Mãe/Responsável:</strong> {historico.aluno.nomeMae}
            </p>
          ) : null}
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-700">
            Matrículas
          </h2>
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2 pr-3 font-medium">Ano</th>
                <th className="py-2 pr-3 font-medium">Turma</th>
                <th className="py-2 pr-3 font-medium">Escola</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {historico.matriculas.map((matricula) => (
                <tr key={matricula.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3">{matricula.anoLetivo ?? "—"}</td>
                  <td className="py-2 pr-3">
                    {matricula.turmaNome} ({matricula.serie}) — {matricula.turno}
                  </td>
                  <td className="py-2 pr-3">{matricula.escolaNome}</td>
                  <td className="py-2">
                    {MATRICULA_STATUS_LABEL[matricula.status] ?? matricula.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {historico.notasAtuais.length > 0 ? (
          <section className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase text-slate-700">
              Rendimento escolar (matrícula atual)
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Disciplina</th>
                    {historico.bimestres.map((bimestre) => (
                      <th key={bimestre.id} className="py-2 px-2 font-medium">
                        {bimestre.numero}º B
                      </th>
                    ))}
                    <th className="py-2 pl-2 font-medium">Média</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.notasAtuais.map((item) => (
                    <tr
                      key={item.disciplina}
                      className="border-b border-slate-100"
                    >
                      <td className="py-2 pr-3">{item.disciplina}</td>
                      {historico.bimestres.map((bimestre) => (
                        <td key={bimestre.id} className="px-2 py-2 text-center">
                          {formatNota(item.mediasPorBimestre[bimestre.numero] ?? null)}
                        </td>
                      ))}
                      <td className="py-2 pl-2 font-semibold">
                        {formatNota(item.mediaAnual)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <p className="mt-10 text-right text-sm text-slate-700">
          {municipio}, {dataEmissao}
        </p>
      </article>
    </div>
  );
}
