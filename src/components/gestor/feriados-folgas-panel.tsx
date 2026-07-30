"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  criarFolgaEscolar,
  excluirFolgaEscolar,
} from "@/actions/gestor-entrada-feriados";
import { Button } from "@/components/ui/button";
import {
  FOLGA_TIPO_LABEL,
  type FolgaEscolar,
} from "@/lib/gestor-modulos-types";
import type { CalendarioEvento } from "@/lib/calendario-escolar";

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

export function FeriadosOficiaisList({
  eventos,
}: {
  eventos: CalendarioEvento[];
}) {
  if (eventos.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Nenhum feriado ou recesso cadastrado no calendário oficial.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {eventos.map((evento, index) => (
        <li
          key={`${evento.titulo}-${index}`}
          className="rounded-lg border border-slate-100 px-3 py-2 text-sm"
        >
          <p className="font-medium text-slate-900">{evento.titulo}</p>
          <p className="text-xs text-slate-500">
            {FOLGA_TIPO_LABEL[evento.tipo] ?? evento.tipo} —{" "}
            {formatDate(evento.dataInicio)}
            {evento.dataFim !== evento.dataInicio
              ? ` a ${formatDate(evento.dataFim)}`
              : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function FolgaEscolarForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await criarFolgaEscolar(new FormData(event.currentTarget));
      if (result.error) setError(result.error);
      else {
        event.currentTarget.reset();
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <input
        name="titulo"
        required
        placeholder="Título da folga"
        className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="data_inicio"
          type="date"
          required
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
        />
        <input
          name="data_fim"
          type="date"
          placeholder="Data fim (opcional)"
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
        />
      </div>
      <textarea
        name="descricao"
        rows={2}
        placeholder="Observação (opcional)"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399] disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar folga"}
      </button>
    </form>
  );
}

export function FolgaListItem({ folga }: { folga: FolgaEscolar }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Excluir "${folga.titulo}"?`)) return;
    setLoading(true);
    await excluirFolgaEscolar(folga.id);
    router.refresh();
    setLoading(false);
  }

  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm">
      <div>
        <p className="font-medium text-slate-900">{folga.titulo}</p>
        <p className="text-xs text-slate-500">
          {formatDate(folga.dataInicio)}
          {folga.dataFim !== folga.dataInicio
            ? ` a ${formatDate(folga.dataFim)}`
            : ""}
        </p>
        {folga.descricao ? (
          <p className="mt-1 text-slate-600">{folga.descricao}</p>
        ) : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        className="h-8 px-2 text-rose-600"
        disabled={loading}
        onClick={handleDelete}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </li>
  );
}
