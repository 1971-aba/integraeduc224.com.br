"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

type CarteirinhaAluno = {
  id: string;
  nome: string;
  nascimento: string;
  responsavel: string;
};

type CarteirinhasViewProps = {
  escolaNome: string;
  secretariaNome: string;
  municipio: string;
  turmaLabel: string;
  turno: string;
  anoLetivo: number | null;
  alunos: CarteirinhaAluno[];
};

export function CarteirinhasView({
  escolaNome,
  secretariaNome,
  municipio,
  turmaLabel,
  turno,
  anoLetivo,
  alunos,
}: CarteirinhasViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <p className="text-sm text-slate-600">
          {alunos.length} carteirinha(s) — {turmaLabel}
        </p>
        <Button type="button" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
          Imprimir
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2 print:gap-3">
        {alunos.map((aluno) => (
          <article
            key={aluno.id}
            className="flex flex-col rounded-lg border border-slate-300 bg-white p-3 shadow-sm print:break-inside-avoid print:shadow-none"
          >
            <header className="border-b border-slate-200 pb-2 text-center">
              <p className="text-[9px] font-semibold uppercase leading-tight tracking-wide text-slate-500">
                {secretariaNome}
              </p>
              <p className="mt-0.5 text-[11px] font-bold uppercase leading-tight text-slate-900">
                {escolaNome}
              </p>
              <p className="mt-0.5 text-[9px] uppercase tracking-wide text-slate-500">
                Carteira do Estudante
                {anoLetivo ? ` · ${anoLetivo}` : ""}
              </p>
            </header>

            <div className="mt-3 flex gap-3">
              <div className="flex h-[68px] w-[52px] shrink-0 items-center justify-center rounded border border-dashed border-slate-400 text-[8px] uppercase text-slate-400">
                Foto
              </div>

              <dl className="min-w-0 flex-1 space-y-1.5 text-[10px]">
                <Dado rotulo="Nome" valor={aluno.nome} destaque />
                <Dado rotulo="Turma" valor={`${turmaLabel} · ${turno}`} />
                <Dado rotulo="Nascimento" valor={aluno.nascimento} />
                <Dado rotulo="Responsável" valor={aluno.responsavel} />
              </dl>
            </div>

            <footer className="mt-3 flex items-end justify-between gap-2 border-t border-slate-200 pt-2">
              <p className="text-[8px] uppercase tracking-wide text-slate-500">
                {municipio}
              </p>
              <div className="w-24 border-t border-slate-400 pt-0.5 text-center text-[7px] uppercase text-slate-500">
                Gestão Escolar
              </div>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}

function Dado({
  rotulo,
  valor,
  destaque,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div>
      <dt className="text-[8px] uppercase tracking-wide text-slate-500">
        {rotulo}
      </dt>
      <dd
        className={
          destaque
            ? "truncate font-bold uppercase text-slate-900"
            : "truncate text-slate-700"
        }
      >
        {valor}
      </dd>
    </div>
  );
}
