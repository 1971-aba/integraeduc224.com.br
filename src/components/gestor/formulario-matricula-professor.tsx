"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

type FormularioMatriculaProfessorProps = {
  escolaNome: string;
  secretariaNome: string;
  municipio: string;
  anoLetivo: number | null;
  professor: {
    nome: string;
    cpf: string | null;
    email: string | null;
    disciplinas: string[];
  } | null;
};

export function FormularioMatriculaProfessor({
  escolaNome,
  secretariaNome,
  municipio,
  anoLetivo,
  professor,
}: FormularioMatriculaProfessorProps) {
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
            Formulário de Matrícula do Professor
            {anoLetivo ? ` — ${anoLetivo}` : ""}
          </p>
        </header>

        <Secao titulo="Identificação">
          <Linha label="Nome completo" valor={professor?.nome} />
          <div className="flex gap-6">
            <Linha label="CPF" valor={professor?.cpf} />
            <Linha label="RG / órgão emissor" />
          </div>
          <div className="flex gap-6">
            <Linha label="Data de nascimento" />
            <Linha label="Estado civil" />
          </div>
          <div className="flex gap-6">
            <Linha label="Telefone" />
            <Linha label="E-mail" valor={professor?.email} />
          </div>
        </Secao>

        <Secao titulo="Endereço">
          <Linha label="Endereço completo" />
          <div className="flex gap-6">
            <Linha label="Bairro" />
            <Linha label="CEP" />
          </div>
        </Secao>

        <Secao titulo="Formação acadêmica">
          <Linha label="Graduação" />
          <Linha label="Instituição de formação" />
          <div className="flex gap-6">
            <Linha label="Ano de conclusão" />
            <Linha label="Registro no conselho / MEC" />
          </div>
          <Campo label="Pós-graduações, especializações e cursos" linhas={2} />
        </Secao>

        <Secao titulo="Vínculo com a escola">
          <div className="flex gap-6">
            <Linha label="Data de admissão" />
            <Linha label="Carga horária semanal" />
          </div>
          <Marcadores
            titulo="Tipo de vínculo"
            opcoes={["Efetivo", "Contrato", "Substituto", "Voluntário"]}
          />
          <Linha
            label="Disciplinas / componentes que leciona"
            valor={
              professor?.disciplinas.length
                ? professor.disciplinas.join(", ")
                : undefined
            }
          />
          <Campo label="Turmas atribuídas" linhas={2} />
        </Secao>

        <Secao titulo="Documentos apresentados">
          <Marcadores
            titulo="Marque os documentos entregues"
            opcoes={[
              "CPF",
              "RG",
              "Comprovante de residência",
              "Diploma / certificado",
              "Histórico escolar",
              "Carteira do conselho",
            ]}
          />
        </Secao>

        <footer className="mt-10 space-y-8 text-sm text-slate-700">
          <p>
            Declaro que as informações acima são verdadeiras e autorizo a
            unidade escolar a utilizá-las para fins administrativos e
            pedagógicos.
          </p>
          <div className="flex gap-10">
            <div className="flex-1 border-t border-slate-400 pt-2 text-center">
              Assinatura do professor
            </div>
            <div className="w-40 border-t border-slate-400 pt-2 text-center">
              Data
            </div>
          </div>
        </footer>
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
    <section className="mt-6">
      <h2 className="mb-3 border-b border-slate-200 pb-1 text-sm font-semibold uppercase tracking-wide text-slate-800">
        {titulo}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Linha({ label, valor }: { label: string; valor?: string | null }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {valor ? (
        <p className="border-b border-slate-400 pb-1 text-sm text-slate-900">
          {valor}
        </p>
      ) : (
        <div className="h-7 border-b border-slate-400" />
      )}
    </div>
  );
}

function Campo({ label, linhas }: { label: string; linhas: number }) {
  return (
    <div>
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="mt-1 space-y-2">
        {Array.from({ length: linhas }, (_, i) => (
          <div key={i} className="h-6 border-b border-slate-400" />
        ))}
      </div>
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
      <p className="text-xs font-medium text-slate-500">{titulo}</p>
      <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-700">
        {opcoes.map((opcao) => (
          <span key={opcao} className="inline-flex items-center gap-2">
            <span className="inline-block h-3.5 w-3.5 border border-slate-500" />
            {opcao}
          </span>
        ))}
      </div>
    </div>
  );
}
