"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  criarEscalaVigilante,
  excluirEscalaVigilante,
} from "@/actions/gestor-operacional";
import { Button } from "@/components/ui/button";
import {
  TURNO_VIGILANCIA_LABEL,
  type EscalaVigilante,
  type TurnoVigilancia,
} from "@/lib/gestor-modulos-types";

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

export function EscalaVigilanteForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await criarEscalaVigilante(new FormData(event.currentTarget));
      if (result.error) setError(result.error);
      else {
        event.currentTarget.reset();
        router.refresh();
      }
    });
  }

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold text-slate-900">Nova escala</h3>
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="data"
          type="date"
          required
          defaultValue={hoje}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
        />
        <select
          name="turno"
          defaultValue="manha"
          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
        >
          {(Object.keys(TURNO_VIGILANCIA_LABEL) as TurnoVigilancia[]).map(
            (turno) => (
              <option key={turno} value={turno}>
                {TURNO_VIGILANCIA_LABEL[turno]}
              </option>
            ),
          )}
        </select>
      </div>

      <input
        name="vigilante_nome"
        required
        placeholder="Nome do vigilante"
        className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
      />
      <input
        name="observacao"
        placeholder="Observação (posto, portaria...)"
        className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
      />

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399] disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar"}
      </button>
    </form>
  );
}

export function EscalaVigilanteItem({ item }: { item: EscalaVigilante }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Remover escala de ${item.vigilanteNome}?`)) return;
    setLoading(true);
    await excluirEscalaVigilante(item.id);
    router.refresh();
    setLoading(false);
  }

  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm">
      <div>
        <p className="font-medium text-slate-900">{item.vigilanteNome}</p>
        <p className="text-slate-600">
          {formatDate(item.data)} — {TURNO_VIGILANCIA_LABEL[item.turno]}
        </p>
        {item.observacao ? (
          <p className="mt-1 text-xs text-slate-500">{item.observacao}</p>
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
