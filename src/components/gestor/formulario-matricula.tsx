"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

type FormularioMatriculaProps = {
  escolaNome: string;
  secretariaNome: string;
  municipio: string;
  anoLetivo: number | null;
  aluno: {
    nome: string;
    nascimento: string | null;
    cpf: string | null;
    nis: string | null;
    nomeMae: string | null;
    turma: string | null;
  } | null;
};

export function FormularioMatricula({
  escolaNome,
  secretariaNome,
  municipio,
  anoLetivo,
  aluno,
}: FormularioMatriculaProps) {
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
            Formulário de Matrícula
            {anoLetivo ? ` — ${anoLetivo}` : ""}
          </p>
        </header>

        <Secao titulo="Dados do aluno">
          <Linha label="Nome completo" valor={aluno?.nome} />
          <div className="flex gap-6">
            <Linha label="Data de nascimento" valor={aluno?.nascimento} />
            <Linha label="Sexo" />
            <Linha label="Cor / raça" />
          </div>
          <div className="flex gap-6">
            <Linha label="Naturalidade" />
            <Linha label="UF" />
            <Linha label="Nacionalidade" />
          </div>
          <div className="flex gap-6">
            <Linha label="CPF" valor={aluno?.cpf} />
            <Linha label="NIS" valor={aluno?.nis} />
          </div>
          <div className="flex gap-6">
            <Linha label="Certidão de nascimento" />
            <Linha label="RG" />
          </div>
        </Secao>

        <Secao titulo="Filiação e responsável">
          <Linha label="Nome da mãe" valor={aluno?.nomeMae} />
          <Linha label="Nome do pai" />
          <div className="flex gap-6">
            <Linha label="Responsável legal" />
            <Linha label="Parentesco" />
          </div>
          <div className="flex gap-6">
            <Linha label="CPF do responsável" />
            <Linha label="Telefone" />
          </div>
        </Secao>

        <Secao titulo="Endereço e contato">
          <Linha label="Endereço" />
          <div className="flex gap-6">
            <Linha label="Bairro / localidade" />
            <Linha label="CEP" />
          </div>
          <div className="flex gap-6">
            <Linha label="Zona (urbana / rural)" />
            <Linha label="Telefone alternativo" />
          </div>
        </Secao>

        <Secao titulo="Dados da matrícula">
          <div className="flex gap-6">
            <Linha label="Série / ano" />
            <Linha label="Turma" valor={aluno?.turma} />
            <Linha label="Turno" />
          </div>
          <div className="flex gap-6">
            <Linha label="Escola de origem" />
            <Linha label="Ano de conclusão" />
          </div>
          <Marcadores
            titulo="Transporte escolar"
            opcoes={["Não utiliza", "Ônibus escolar", "Outro"]}
          />
          <Marcadores
            titulo="Programas sociais"
            opcoes={["Bolsa Família", "BPC", "Nenhum"]}
          />
          <Marcadores
            titulo="Atendimento Educacional Especializado (AEE)"
            opcoes={["Não", "Sim"]}
          />
        </Secao>

        <Secao titulo="Documentos apresentados">
          <Marcadores
            titulo=""
            opcoes={[
              "Certidão de nascimento",
              "CPF",
              "Comprovante de residência",
              "Cartão de vacina",
              "Histórico escolar",
              "Foto 3x4",
            ]}
          />
        </Secao>

        <p className="mt-8 text-sm text-slate-700">
          Declaro que as informações prestadas são verdadeiras e que estou
          ciente das normas de funcionamento desta unidade escolar.
        </p>

        <p className="mt-6 text-right text-sm text-slate-700">
          {municipio}, ______ de __________________ de 20____
        </p>

        <div className="mt-16 flex gap-10">
          <div className="flex-1 border-t border-slate-400 pt-2 text-center text-xs text-slate-600">
            Assinatura do responsável
          </div>
          <div className="flex-1 border-t border-slate-400 pt-2 text-center text-xs text-slate-600">
            Secretaria da Escola
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

function Linha({ label, valor }: { label: string; valor?: string | null }) {
  return (
    <div className="flex min-w-0 flex-1 items-end gap-2">
      <span className="whitespace-nowrap text-xs uppercase tracking-wide text-slate-600">
        {label}
      </span>
      <span className="min-w-0 flex-1 truncate border-b border-dotted border-slate-400 px-1 text-sm font-medium text-slate-900">
        {valor ?? ""}
      </span>
    </div>
  );
}

function Marcadores({
  titulo,
  opcoes,
}: {
  titulo: string;
  opcoes: string[];
}) {
  return (
    <div>
      {titulo ? (
        <span className="text-xs uppercase tracking-wide text-slate-600">
          {titulo}
        </span>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
        {opcoes.map((opcao) => (
          <span
            key={opcao}
            className="flex items-center gap-2 text-sm text-slate-800"
          >
            <span className="h-3.5 w-3.5 border border-slate-500" />
            {opcao}
          </span>
        ))}
      </div>
    </div>
  );
}
