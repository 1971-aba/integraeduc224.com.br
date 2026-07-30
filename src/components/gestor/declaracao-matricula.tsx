"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

type DeclaracaoMatriculaProps = {
  escolaNome: string;
  secretariaNome: string;
  municipio: string;
  alunoNome: string;
  alunoCpf: string | null;
  nomeMae: string | null;
  turmaNome: string | null;
  turmaSerie: string | null;
  anoLetivo: number | null;
  dataEmissao: string;
};

export function DeclaracaoMatricula({
  escolaNome,
  secretariaNome,
  municipio,
  alunoNome,
  alunoCpf,
  nomeMae,
  turmaNome,
  turmaSerie,
  anoLetivo,
  dataEmissao,
}: DeclaracaoMatriculaProps) {
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
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            {secretariaNome}
          </p>
          <p className="mt-1 text-sm text-slate-600">{municipio}</p>
          <h1 className="mt-4 text-xl font-bold uppercase text-slate-900">
            {escolaNome}
          </h1>
          <p className="mt-6 text-lg font-semibold text-slate-900">
            DECLARAÇÃO DE MATRÍCULA
          </p>
        </header>

        <div className="mt-8 space-y-6 text-justify text-base leading-relaxed text-slate-800">
          <p>
            Declaramos, para os devidos fins, que{" "}
            <strong>{alunoNome.toUpperCase()}</strong>
            {alunoCpf ? (
              <>
                , inscrito(a) no CPF sob nº <strong>{alunoCpf}</strong>
              </>
            ) : null}
            {nomeMae ? (
              <>
                , filho(a) de <strong>{nomeMae.toUpperCase()}</strong>
              </>
            ) : null}
            , encontra-se regularmente matriculado(a) nesta unidade escolar
            {turmaNome && turmaSerie ? (
              <>
                , na turma <strong>{turmaNome}</strong> ({turmaSerie})
              </>
            ) : null}
            {anoLetivo ? (
              <>
                , no ano letivo de <strong>{anoLetivo}</strong>
              </>
            ) : null}
            .
          </p>

          <p>
            Por ser verdade, firmamos a presente declaração para que produza os
            efeitos legais.
          </p>

          <p className="pt-4 text-right text-slate-700">{municipio}, {dataEmissao}</p>

          <div className="pt-16 text-center">
            <div className="mx-auto w-64 border-t border-slate-400 pt-2 text-sm text-slate-600">
              Gestão Escolar
              <br />
              {escolaNome}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
