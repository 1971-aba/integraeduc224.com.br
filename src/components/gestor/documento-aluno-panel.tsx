"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";

import { salvarDocumentoAluno } from "@/actions/gestor-documentos-alunos";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  formatarDocumento,
  type DocumentoAluno,
} from "@/lib/documentos-aluno-config";
import type { AlunoDocumento } from "@/lib/gestor-documentos-alunos";

type DocumentoAlunoPanelProps = {
  documento: DocumentoAluno;
  pendentes: AlunoDocumento[];
  informados: AlunoDocumento[];
};

export function DocumentoAlunoPanel({
  documento,
  pendentes,
  informados,
}: DocumentoAlunoPanelProps) {
  const [salvando, setSalvando] = useState<string | null>(null);
  const [salvos, setSalvos] = useState<Record<string, boolean>>({});
  const [erros, setErros] = useState<Record<string, string>>({});
  const [mostrarInformados, setMostrarInformados] = useState(false);

  async function handleSalvar(alunoId: string, formData: FormData) {
    setSalvando(alunoId);
    setErros(({ [alunoId]: _, ...resto }) => resto);

    const result = await salvarDocumentoAluno(documento.id, alunoId, formData);
    setSalvando(null);

    if (result?.error) {
      setErros((atual) => ({ ...atual, [alunoId]: result.error as string }));
      return;
    }

    setSalvos((atual) => ({ ...atual, [alunoId]: true }));
  }

  function linha(aluno: AlunoDocumento) {
    return (
      <li key={aluno.id} className="py-4">
        <form
          action={(formData) => handleSalvar(aluno.id, formData)}
          className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="min-w-0">
            <p className="font-medium text-slate-900">{aluno.nome}</p>
            <p className="text-sm text-slate-600">{aluno.turma}</p>
            {erros[aluno.id] ? (
              <p className="mt-1 text-sm text-red-700" role="alert">
                {erros[aluno.id]}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div>
              <label
                htmlFor={`valor_${aluno.id}`}
                className="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                {documento.nome}
              </label>
              <Input
                id={`valor_${aluno.id}`}
                name="valor"
                defaultValue={aluno.valor ?? ""}
                placeholder={documento.placeholder}
                className="mt-1 sm:w-56"
              />
            </div>

            {documento.id === "rg" ? (
              <div>
                <label
                  htmlFor={`orgao_${aluno.id}`}
                  className="text-xs font-medium uppercase tracking-wide text-slate-500"
                >
                  Órgão emissor
                </label>
                <Input
                  id={`orgao_${aluno.id}`}
                  name="orgao_emissor"
                  defaultValue={aluno.complemento ?? ""}
                  placeholder="SSP/PI"
                  className="mt-1 sm:w-32"
                />
              </div>
            ) : null}

            <Button
              type="submit"
              variant="secondary"
              disabled={salvando === aluno.id}
              className="shrink-0"
            >
              {salvando === aluno.id ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : salvos[aluno.id] ? (
                <>
                  <Check
                    className="mr-2 h-4 w-4 text-green-600"
                    aria-hidden="true"
                  />
                  Salvo
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </form>
      </li>
    );
  }

  const total = pendentes.length + informados.length;

  if (total === 0) {
    return (
      <Card>
        <CardTitle>Nenhum aluno matriculado</CardTitle>
        <CardDescription>
          Matricule alunos nesta escola para cadastrar o {documento.nome}.
        </CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>
          {pendentes.length} aluno(s) sem {documento.nome}
        </CardTitle>
        <CardDescription>{documento.ajuda}</CardDescription>

        {pendentes.length > 0 ? (
          <ul className="mt-4 divide-y divide-slate-100">
            {pendentes.map(linha)}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
            Todos os {total} alunos matriculados já têm {documento.nome}{" "}
            cadastrado.
          </p>
        )}
      </Card>

      {informados.length > 0 ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>
                {informados.length} aluno(s) já com {documento.nome}
              </CardTitle>
              <CardDescription>
                Abra a lista para corrigir um número já cadastrado
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMostrarInformados((atual) => !atual)}
            >
              {mostrarInformados ? "Ocultar" : "Mostrar"}
            </Button>
          </div>

          {mostrarInformados ? (
            <ul className="mt-4 divide-y divide-slate-100">
              {informados.map(linha)}
            </ul>
          ) : (
            <ul className="mt-4 space-y-1 text-sm text-slate-600">
              {informados.slice(0, 5).map((aluno) => (
                <li key={aluno.id}>
                  {aluno.nome} —{" "}
                  <span className="font-medium text-slate-900">
                    {formatarDocumento(documento, aluno.valor ?? "")}
                  </span>
                </li>
              ))}
              {informados.length > 5 ? (
                <li className="text-slate-400">
                  e outros {informados.length - 5}
                </li>
              ) : null}
            </ul>
          )}
        </Card>
      ) : null}
    </div>
  );
}
