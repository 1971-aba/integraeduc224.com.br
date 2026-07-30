"use client";

import { Loader2, Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  atualizarTurma,
  excluirTurma,
} from "@/actions/gestor-estrutura";
import { Button } from "@/components/ui/button";
import { formatTurnoLabel } from "@/lib/dashboard-utils";

type Option = { id: string; label: string };

type TurmaListItemProps = {
  turma: {
    id: string;
    nome: string;
    serie: string;
    turno: string;
    ano_letivo_id: string;
  };
  anoLabel: string;
  escolaLabel?: string;
  anosLetivos: Option[];
};

const turnoOptions = [
  { value: "manha", label: formatTurnoLabel("manha") },
  { value: "tarde", label: formatTurnoLabel("tarde") },
  { value: "noite", label: formatTurnoLabel("noite") },
  { value: "integral", label: formatTurnoLabel("integral") },
];

export function TurmaListItem({
  turma,
  anoLabel,
  escolaLabel,
  anosLetivos,
}: TurmaListItemProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await atualizarTurma(turma.id, formData);

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
        `Excluir a turma "${turma.nome}"? Esta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    const result = await excluirTurma(turma.id);

    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setLoading(false);
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
        <form action={handleUpdate} className="space-y-3">
          <div>
            <label
              htmlFor={`nome-${turma.id}`}
              className="text-xs font-medium text-slate-700"
            >
              Nome da turma
            </label>
            <input
              id={`nome-${turma.id}`}
              name="nome"
              required
              defaultValue={turma.nome}
              className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor={`serie-${turma.id}`}
              className="text-xs font-medium text-slate-700"
            >
              Série
            </label>
            <input
              id={`serie-${turma.id}`}
              name="serie"
              required
              defaultValue={turma.serie}
              className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor={`turno-${turma.id}`}
              className="text-xs font-medium text-slate-700"
            >
              Turno
            </label>
            <select
              id={`turno-${turma.id}`}
              name="turno"
              required
              defaultValue={turma.turno}
              className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              {turnoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`ano-${turma.id}`}
              className="text-xs font-medium text-slate-700"
            >
              Ano letivo
            </label>
            <select
              id={`ano-${turma.id}`}
              name="ano_letivo_id"
              required
              defaultValue={turma.ano_letivo_id}
              className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              {anosLetivos.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
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
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="font-semibold text-slate-900">{turma.nome}</p>
      <p className="mt-1 text-sm text-slate-600">
        {turma.serie} • {formatTurnoLabel(turma.turno)}
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Ano letivo {anoLabel}
        {escolaLabel ? ` • ${escolaLabel}` : null}
      </p>

      {error ? (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
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
  );
}
