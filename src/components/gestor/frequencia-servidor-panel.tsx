"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  excluirFaltaServidor,
  lancarFaltaServidor,
} from "@/actions/gestor-frequencia-servidor";
import { Button } from "@/components/ui/button";
import type { FrequenciaServidorFalta } from "@/lib/gestor-modulos-types";

type ServidorOption = { id: string; nome: string };

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

export function LancarFaltasServidorForm({
  servidores,
}: {
  servidores: ServidorOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const hoje = new Date().toISOString().slice(0, 10);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await lancarFaltaServidor(new FormData(event.currentTarget));
      if (result.error) setError(result.error);
      else {
        event.currentTarget.reset();
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-semibold text-slate-900">Lançar falta do dia</h3>
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <input
        name="data"
        type="date"
        required
        defaultValue={hoje}
        className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
      />

      <select
        name="servidor_id"
        defaultValue=""
        className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
      >
        <option value="">Selecione o servidor</option>
        {servidores.map((servidor) => (
          <option key={servidor.id} value={servidor.id}>
            {servidor.nome}
          </option>
        ))}
      </select>

      <input
        name="observacao"
        placeholder="Observação (opcional)"
        className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
      />

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar falta"}
      </button>
    </form>
  );
}

export function FaltaServidorListItem({ item }: { item: FrequenciaServidorFalta }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Excluir falta de ${item.servidorNome}?`)) return;
    setLoading(true);
    await excluirFaltaServidor(item.id);
    router.refresh();
    setLoading(false);
  }

  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm">
      <div>
        <p className="font-medium text-slate-900">{item.servidorNome}</p>
        <p className="text-slate-600">{formatDate(item.data)}</p>
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
