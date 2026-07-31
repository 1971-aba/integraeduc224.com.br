"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  criarMerendaEstoqueItem,
  excluirMerendaEstoqueItem,
} from "@/actions/gestor-operacional";
import { Button } from "@/components/ui/button";
import type { MerendaEstoqueItem } from "@/lib/gestor-modulos-types";

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

export function MerendaEstoqueForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await criarMerendaEstoqueItem(
        new FormData(event.currentTarget),
      );
      if (result.error) setError(result.error);
      else {
        event.currentTarget.reset();
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-semibold text-slate-900">Novo insumo</h3>
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <input
        name="nome"
        required
        placeholder="Nome do insumo"
        className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          name="quantidade"
          type="number"
          min={0}
          step="0.01"
          defaultValue={0}
          placeholder="Qtd."
          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
        />
        <input
          name="unidade"
          defaultValue="kg"
          placeholder="Unidade"
          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
        />
      </div>
      <input
        name="estoque_minimo"
        type="number"
        min={0}
        defaultValue={0}
        placeholder="Estoque mínimo"
        className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
      />
      <input
        name="validade"
        type="date"
        className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar"}
      </button>
    </form>
  );
}

export function MerendaEstoqueListItem({ item }: { item: MerendaEstoqueItem }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const baixo = item.quantidade <= item.estoqueMinimo;

  async function handleDelete() {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    setLoading(true);
    await excluirMerendaEstoqueItem(item.id);
    router.refresh();
    setLoading(false);
  }

  return (
    <li className="rounded-xl border border-slate-100 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{item.nome}</p>
          <p className={`mt-1 font-semibold ${baixo ? "text-rose-600" : "text-slate-900"}`}>
            {item.quantidade} {item.unidade}
            {baixo ? " (estoque baixo)" : ""}
          </p>
          <p className="text-xs text-slate-500">Mínimo: {item.estoqueMinimo}</p>
          {item.validade ? (
            <p className="text-xs text-slate-500">
              Validade: {formatDate(item.validade)}
            </p>
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
      </div>
    </li>
  );
}
