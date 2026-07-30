"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

type FichaMedicaBrancoProps = {
  escolaNome: string;
  secretariaNome: string;
  municipio: string;
};

export function FichaMedicaBranco({
  escolaNome,
  secretariaNome,
  municipio,
}: FichaMedicaBrancoProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end print:hidden">
        <Button type="button" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
          Imprimir
        </Button>
      </div>

      <article className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none">
        <header className="border-b border-slate-300 pb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            {secretariaNome}
          </p>
          <p className="mt-1 text-sm text-slate-600">{municipio}</p>
          <h1 className="mt-3 text-lg font-bold uppercase text-slate-900">
            {escolaNome}
          </h1>
          <p className="mt-4 text-base font-semibold uppercase text-slate-900">
            Ficha de Informações Médicas do Aluno
          </p>
        </header>

        <Secao titulo="Identificação do aluno">
          <Linha label="Nome completo" />
          <div className="flex gap-6">
            <Linha label="Data de nascimento" />
            <Linha label="Turma / Série" />
            <Linha label="Turno" />
          </div>
          <div className="flex gap-6">
            <Linha label="CPF" />
            <Linha label="NIS" />
          </div>
          <Linha label="Mãe / responsável" />
          <Linha label="Endereço" />
          <div className="flex gap-6">
            <Linha label="Telefone" />
            <Linha label="Telefone alternativo" />
          </div>
        </Secao>

        <Secao titulo="Informações de saúde">
          <div className="flex gap-6">
            <Linha label="Tipo sanguíneo" />
            <Linha label="Plano de saúde" />
          </div>
          <Linha label="Unidade de saúde de referência" />
          <Campo label="Alergias" linhas={2} />
          <Campo label="Medicamentos de uso contínuo" linhas={2} />
          <Campo label="Restrições alimentares" linhas={2} />
          <Campo label="Condições de saúde e deficiências" linhas={2} />
          <Campo label="Observações" linhas={3} />
        </Secao>

        <Secao titulo="Contato de emergência">
          <div className="flex gap-6">
            <Linha label="Nome" />
            <Linha label="Parentesco" />
          </div>
          <div className="flex gap-6">
            <Linha label="Telefone 1" />
            <Linha label="Telefone 2" />
          </div>
        </Secao>

        <p className="mt-8 text-sm text-slate-700">
          Declaro que as informações acima são verdadeiras e autorizo a escola a
          adotar as providências necessárias em caso de emergência.
        </p>

        <p className="mt-6 text-right text-sm text-slate-700">
          {municipio}, ______ de __________________ de 20____
        </p>

        <div className="mt-16 flex gap-10">
          <div className="flex-1 border-t border-slate-400 pt-2 text-center text-xs text-slate-600">
            Assinatura do responsável
          </div>
          <div className="flex-1 border-t border-slate-400 pt-2 text-center text-xs text-slate-600">
            Gestão Escolar
          </div>
        </div>
      </article>
    </div>
  );
}

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 print:break-inside-avoid">
      <h2 className="bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700">
        {titulo}
      </h2>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}

function Linha({ label }: { label: string }) {
  return (
    <div className="flex flex-1 items-end gap-2">
      <span className="whitespace-nowrap text-xs uppercase tracking-wide text-slate-600">
        {label}
      </span>
      <span className="flex-1 border-b border-dotted border-slate-400" />
    </div>
  );
}

function Campo({ label, linhas }: { label: string; linhas: number }) {
  return (
    <div>
      <span className="text-xs uppercase tracking-wide text-slate-600">
        {label}
      </span>
      <div className="mt-3 space-y-5">
        {Array.from({ length: linhas }, (_, index) => (
          <div
            key={index}
            className="border-b border-dotted border-slate-400"
          />
        ))}
      </div>
    </div>
  );
}
