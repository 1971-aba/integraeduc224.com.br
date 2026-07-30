"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  criarAlmoxarifadoItem,
  excluirAlmoxarifadoItem,
  movimentarAlmoxarifadoItem,
} from "@/actions/gestor-estrutura-almoxarifado";
import { Button } from "@/components/ui/button";
import {
  ALMOXARIFADO_CATEGORIA_LABEL,
  ALMOXARIFADO_CATEGORIAS,
  type AlmoxarifadoItem,
} from "@/lib/gestor-modulos-types";

export function AlmoxarifadoItemForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await criarAlmoxarifadoItem(new FormData(event.currentTarget));
      if (result.error) setError(result.error);
      else {
        event.currentTarget.reset();
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-semibold text-slate-900">Novo item</h3>
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      <input name="nome" required placeholder="Nome do item" className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" />
      <select name="categoria" defaultValue="geral" className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm">
        {ALMOXARIFADO_CATEGORIAS.map((cat) => (
          <option key={cat} value={cat}>{ALMOXARIFADO_CATEGORIA_LABEL[cat]}</option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input name="quantidade" type="number" min={0} step="0.01" defaultValue={0} placeholder="Qtd." className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
        <input name="unidade" defaultValue="un" placeholder="Unidade" className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
      </div>
      <input name="estoque_minimo" type="number" min={0} defaultValue={0} placeholder="Estoque mínimo" className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" />
      <button type="submit" disabled={pending} className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white disabled:opacity-60">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar"}
      </button>
    </form>
  );
}

export function AlmoxarifadoListItem({ item }: { item: AlmoxarifadoItem }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [movPending, startMov] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const baixo = item.quantidade <= item.estoqueMinimo;

  async function handleDelete() {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    setLoading(true);
    await excluirAlmoxarifadoItem(item.id);
    router.refresh();
    setLoading(false);
  }

  return (
    <li className="rounded-xl border border-slate-100 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{item.nome}</p>
          <p className="text-slate-600">
            {ALMOXARIFADO_CATEGORIA_LABEL[item.categoria] ?? item.categoria}
          </p>
          <p className={`mt-1 font-semibold ${baixo ? "text-rose-600" : "text-slate-900"}`}>
            {item.quantidade} {item.unidade}
            {baixo ? " (estoque baixo)" : ""}
          </p>
          <p className="text-xs text-slate-500">Mínimo: {item.estoqueMinimo}</p>
        </div>
        <Button type="button" variant="ghost" className="h-8 px-2 text-rose-600" disabled={loading} onClick={handleDelete}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          const formData = new FormData(event.currentTarget);
          startMov(async () => {
            const result = await movimentarAlmoxarifadoItem(item.id, formData);
            if (result.error) setError(result.error);
            else {
              event.currentTarget.reset();
              router.refresh();
            }
          });
        }}
        className="mt-3 flex flex-wrap gap-2"
      >
        <select
          name="tipo"
          defaultValue="entrada"
          className="h-8 rounded-md border border-slate-300 px-2 text-xs"
        >
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
        <input
          name="quantidade"
          type="number"
          min={0.01}
          step="0.01"
          required
          placeholder="Qtd."
          className="h-8 w-20 rounded-md border border-slate-300 px-2 text-xs"
        />
        <input
          name="motivo"
          placeholder="Motivo"
          className="h-8 min-w-[120px] flex-1 rounded-md border border-slate-300 px-2 text-xs"
        />
        <button
          type="submit"
          disabled={movPending}
          className="h-8 rounded-md bg-[#1E7BB8] px-3 text-xs text-white disabled:opacity-60"
        >
          {movPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Movimentar"}
        </button>
      </form>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </li>
  );
}
