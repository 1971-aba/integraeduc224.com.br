"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";

import { salvarCorRaca } from "@/actions/gestor-alunos-complementares";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CORES_RACA,
  type AlunoComplementar,
} from "@/lib/alunos-complementares-config";

type CorRacaPanelProps = {
  alunos: AlunoComplementar[];
};

export function CorRacaPanel({ alunos }: CorRacaPanelProps) {
  const [salvando, setSalvando] = useState<string | null>(null);
  const [salvos, setSalvos] = useState<Record<string, boolean>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [selecionado, setSelecionado] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      alunos.map((aluno) => [aluno.id, aluno.corRaca ?? ""]),
    ),
  );

  async function handleSalvar(alunoId: string, formData: FormData) {
    setSalvando(alunoId);
    setErro(null);

    const result = await salvarCorRaca(alunoId, formData);
    setSalvando(null);

    if (result?.error) {
      setErro(result.error);
      return;
    }

    setSalvos((atual) => ({ ...atual, [alunoId]: true }));
  }

  if (alunos.length === 0) {
    return (
      <Card>
        <CardTitle>Nenhum aluno matriculado</CardTitle>
        <CardDescription>
          Matricule alunos nesta escola para informar cor, raça e etnia.
        </CardDescription>
      </Card>
    );
  }

  const declarados = alunos.filter((aluno) => aluno.corRaca).length;

  return (
    <Card>
      <CardTitle>
        {declarados} de {alunos.length} aluno(s) com declaração
      </CardTitle>
      <CardDescription>
        Categorias do Censo Escolar. A etnia é obrigatória apenas para
        declarados indígenas.
      </CardDescription>

      {erro ? (
        <p
          className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {erro}
        </p>
      ) : null}

      <ul className="mt-4 divide-y divide-slate-100">
        {alunos.map((aluno) => {
          const valor = selecionado[aluno.id] ?? "";

          return (
            <li key={aluno.id} className="py-4">
              <form
                action={(formData) => handleSalvar(aluno.id, formData)}
                className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{aluno.nome}</p>
                  <p className="text-sm text-slate-600">{aluno.turma}</p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div>
                    <label
                      htmlFor={`cor_raca_${aluno.id}`}
                      className="text-xs font-medium uppercase tracking-wide text-slate-500"
                    >
                      Cor / Raça
                    </label>
                    <select
                      id={`cor_raca_${aluno.id}`}
                      name="cor_raca"
                      value={valor}
                      onChange={(event) =>
                        setSelecionado((atual) => ({
                          ...atual,
                          [aluno.id]: event.target.value,
                        }))
                      }
                      className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 sm:w-48"
                    >
                      <option value="">Não informado</option>
                      {Object.entries(CORES_RACA).map(([chave, label]) => (
                        <option key={chave} value={chave}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {valor === "indigena" ? (
                    <div>
                      <label
                        htmlFor={`etnia_${aluno.id}`}
                        className="text-xs font-medium uppercase tracking-wide text-slate-500"
                      >
                        Etnia
                      </label>
                      <Input
                        id={`etnia_${aluno.id}`}
                        name="etnia_indigena"
                        defaultValue={aluno.etniaIndigena ?? ""}
                        placeholder="Povo indígena"
                        className="mt-1 sm:w-44"
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
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
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
        })}
      </ul>
    </Card>
  );
}
