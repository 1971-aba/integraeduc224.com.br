"use client";

import { Loader2, Trash2, Upload, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  removerFotoAluno,
  salvarFotoAluno,
} from "@/actions/gestor-alunos-complementares";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { AlunoComplementar } from "@/lib/alunos-complementares-config";

type FotografiaAlunoPanelProps = {
  alunos: AlunoComplementar[];
};

export function FotografiaAlunoPanel({ alunos }: FotografiaAlunoPanelProps) {
  const router = useRouter();
  const [processando, setProcessando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handleUpload(alunoId: string, formData: FormData) {
    setProcessando(alunoId);
    setErro(null);

    const result = await salvarFotoAluno(alunoId, formData);
    setProcessando(null);

    if (result?.error) {
      setErro(result.error);
      return;
    }

    router.refresh();
  }

  async function handleRemover(alunoId: string) {
    setProcessando(alunoId);
    setErro(null);

    const result = await removerFotoAluno(alunoId);
    setProcessando(null);

    if (result?.error) {
      setErro(result.error);
      return;
    }

    router.refresh();
  }

  if (alunos.length === 0) {
    return (
      <Card>
        <CardTitle>Nenhum aluno matriculado</CardTitle>
        <CardDescription>
          Matricule alunos nesta escola para incluir as fotografias.
        </CardDescription>
      </Card>
    );
  }

  const comFoto = alunos.filter((aluno) => aluno.fotoUrl).length;

  return (
    <Card>
      <CardTitle>
        {comFoto} de {alunos.length} aluno(s) com fotografia
      </CardTitle>
      <CardDescription>
        JPG, PNG ou WebP de até 2 MB. A foto aparece na carteirinha do
        estudante.
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
        {alunos.map((aluno) => (
          <li
            key={aluno.id}
            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              {aluno.fotoUrl ? (
                // O bucket é privado: a URL é assinada e expira, por isso não
                // passa pelo otimizador de imagens do Next.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={aluno.fotoUrl}
                  alt={`Foto de ${aluno.nome}`}
                  className="h-16 w-12 shrink-0 rounded border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50">
                  <UserRound
                    className="h-5 w-5 text-slate-400"
                    aria-hidden="true"
                  />
                </div>
              )}

              <div className="min-w-0">
                <p className="font-medium text-slate-900">{aluno.nome}</p>
                <p className="text-sm text-slate-600">{aluno.turma}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <form
                action={(formData) => handleUpload(aluno.id, formData)}
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
              >
                <input
                  type="file"
                  name="foto"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  aria-label={`Foto de ${aluno.nome}`}
                  className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={processando === aluno.id}
                  className="shrink-0"
                >
                  {processando === aluno.id ? (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                      Enviar
                    </>
                  )}
                </Button>
              </form>

              {aluno.fotoUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleRemover(aluno.id)}
                  disabled={processando === aluno.id}
                  aria-label={`Remover foto de ${aluno.nome}`}
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
