"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  criarEstruturaEscolar,
  excluirEstruturaEscolar,
} from "@/actions/gestor-estrutura-almoxarifado";
import { Button } from "@/components/ui/button";
import {
  ESTRUTURA_TIPO_LABEL,
  type EstruturaEscolarItem,
  type EstruturaTipo,
} from "@/lib/gestor-modulos-types";

export function EstruturaForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await criarEstruturaEscolar(new FormData(event.currentTarget));
      if (result.error) setError(result.error);
      else {
        event.currentTarget.reset();
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-semibold text-slate-900">Novo espaço</h3>
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      <select name="tipo" defaultValue="sala" className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm">
        {(Object.keys(ESTRUTURA_TIPO_LABEL) as EstruturaTipo[]).map((tipo) => (
          <option key={tipo} value={tipo}>{ESTRUTURA_TIPO_LABEL[tipo]}</option>
        ))}
      </select>
      <input name="nome" required placeholder="Nome / identificação" className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" />
      <input name="capacidade" type="number" min={0} placeholder="Capacidade (opcional)" className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" />
      <textarea name="descricao" rows={2} placeholder="Descrição (opcional)" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      <button type="submit" disabled={pending} className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white disabled:opacity-60">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar"}
      </button>
    </form>
  );
}

export function EstruturaListItem({ item }: { item: EstruturaEscolarItem }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    setLoading(true);
    await excluirEstruturaEscolar(item.id);
    router.refresh();
    setLoading(false);
  }

  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm">
      <div>
        <p className="font-medium text-slate-900">{item.nome}</p>
        <p className="text-slate-600">{ESTRUTURA_TIPO_LABEL[item.tipo]}</p>
        {item.capacidade != null ? (
          <p className="text-xs text-slate-500">Capacidade: {item.capacidade}</p>
        ) : null}
        {item.descricao ? (
          <p className="mt-1 text-slate-600">{item.descricao}</p>
        ) : null}
      </div>
      <Button type="button" variant="ghost" className="h-8 px-2 text-rose-600" disabled={loading} onClick={handleDelete}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </li>
  );
}
