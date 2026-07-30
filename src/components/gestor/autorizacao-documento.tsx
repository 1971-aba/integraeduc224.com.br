"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCpf } from "@/lib/utils";

const TIPOS_AUTORIZACAO: Record<
  string,
  { titulo: string; texto: (ctx: AutorizacaoContext) => string }
> = {
  saida_antecipada: {
    titulo: "AUTORIZAÇÃO DE SAÍDA ANTECIPADA",
    texto: (ctx) =>
      `Autorizamos a saída antecipada do(a) estudante ${ctx.alunoNome.toUpperCase()}, matriculado(a) na turma ${ctx.turmaInfo}, na data de ${ctx.dataEvento}, acompanhado(a) por ${ctx.responsavel || "seu responsável legal"}.${ctx.observacao ? ` Observação: ${ctx.observacao}.` : ""}`,
  },
  uso_imagem: {
    titulo: "AUTORIZAÇÃO DE USO DE IMAGEM",
    texto: (ctx) =>
      `Autorizamos o uso da imagem do(a) estudante ${ctx.alunoNome.toUpperCase()}, matriculado(a) na turma ${ctx.turmaInfo}, em materiais pedagógicos e divulgação institucional da rede municipal de ensino, sem fins comerciais.${ctx.observacao ? ` Observação: ${ctx.observacao}.` : ""}`,
  },
  atividade_externa: {
    titulo: "AUTORIZAÇÃO PARA ATIVIDADE EXTERNA",
    texto: (ctx) =>
      `Autorizamos a participação do(a) estudante ${ctx.alunoNome.toUpperCase()}, matriculado(a) na turma ${ctx.turmaInfo}, em atividade pedagógica externa na data de ${ctx.dataEvento}, sob responsabilidade da escola e acompanhamento dos professores.${ctx.observacao ? ` Observação: ${ctx.observacao}.` : ""}`,
  },
};

type AutorizacaoContext = {
  alunoNome: string;
  turmaInfo: string;
  responsavel: string;
  dataEvento: string;
  observacao: string;
};

type AutorizacaoDocumentoProps = {
  tipo: string;
  escolaNome: string;
  secretariaNome: string;
  municipio: string;
  alunoNome: string;
  alunoCpf: string | null;
  turmaInfo: string;
  responsavel: string;
  dataEvento: string;
  observacao: string;
};

export function AutorizacaoDocumento({
  tipo,
  escolaNome,
  secretariaNome,
  municipio,
  alunoNome,
  alunoCpf,
  turmaInfo,
  responsavel,
  dataEvento,
  observacao,
}: AutorizacaoDocumentoProps) {
  const config = TIPOS_AUTORIZACAO[tipo] ?? TIPOS_AUTORIZACAO.saida_antecipada;
  const ctx: AutorizacaoContext = {
    alunoNome,
    turmaInfo,
    responsavel,
    dataEvento,
    observacao,
  };

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
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            {secretariaNome}
          </p>
          <p className="mt-1 text-sm text-slate-600">{municipio}</p>
          <h1 className="mt-4 text-xl font-bold uppercase text-slate-900">
            {escolaNome}
          </h1>
          <p className="mt-6 text-lg font-semibold text-slate-900">
            {config.titulo}
          </p>
        </header>

        <div className="mt-8 space-y-6 text-justify text-base leading-relaxed text-slate-800">
          <p>{config.texto(ctx)}</p>

          {alunoCpf ? (
            <p className="text-sm text-slate-600">
              CPF do(a) estudante: <strong>{alunoCpf}</strong>
            </p>
          ) : null}

          <p>
            Por ser verdade, firmamos a presente autorização para que produza os
            efeitos legais e administrativos cabíveis.
          </p>

          <p className="pt-4 text-right text-slate-700">
            {municipio}, {dataEmissao}
          </p>

          <div className="grid gap-12 pt-12 sm:grid-cols-2">
            <div className="text-center">
              <div className="border-t border-slate-400 pt-2 text-sm text-slate-600">
                Assinatura do responsável
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-400 pt-2 text-sm text-slate-600">
                Gestão Escolar
                <br />
                {escolaNome}
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export { TIPOS_AUTORIZACAO };
