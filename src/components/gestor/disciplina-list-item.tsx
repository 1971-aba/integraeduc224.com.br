"use client";

import { Loader2, Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  atualizarDisciplina,
  excluirDisciplina,
} from "@/actions/gestor-estrutura";
import { Button } from "@/components/ui/button";

type DisciplinaListItemProps = {
  disciplina: {
    id: string;
    nome: string;
  };
};

export function DisciplinaListItem({ disciplina }: DisciplinaListItemProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await atualizarDisciplina(disciplina.id, formData);

    if (result.error) {
      setError(result.error);
    } else {
      setEditing(false);
      router.refresh();
    }

    setLoading(false);
  }

  async function handleDelete() {
    if (
      !confirm(
        `Excluir a disciplina "${disciplina.nome}"? Esta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    const result = await excluirDisciplina(disciplina.id);

    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setLoading(false);
  }

  if (editing) {
    return (
      <li className="rounded-lg border border-blue-200 bg-blue-50/40 px-4 py-3">
        <form action={handleUpdate} className="space-y-3">
          <div>
            <label
              htmlFor={`disciplina-${disciplina.id}`}
              className="text-xs font-medium text-slate-700"
            >
              Nome da disciplina
            </label>
            <input
              id={`disciplina-${disciplina.id}`}
              name="nome"
              required
              defaultValue={disciplina.nome}
              className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={loading} className="h-9 px-3 text-xs">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                "Salvar"
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              className="h-9 px-3 text-xs"
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
            >
              <X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Cancelar
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="rounded-lg border border-slate-100 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-900">
          {disciplina.nome}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            className="h-8 px-2.5 text-xs"
            onClick={() => {
              setEditing(true);
              setError(null);
            }}
          >
            <Pencil className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            Editar
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            className="h-8 px-2.5 text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
            onClick={handleDelete}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <>
                <Trash2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Excluir
              </>
            )}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </li>
  );
}
