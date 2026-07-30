"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  criarTarefaEscolar,
  excluirTarefaEscolar,
} from "@/actions/professor-tarefas";
import { Button } from "@/components/ui/button";
import type { TarefaEscolar } from "@/lib/gestor-modulos-types";

type TurmaOption = { id: string; label: string };

type TarefaFormProps = {
  turmas: TurmaOption[];
  defaultAtribuicaoId?: string;
};

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

export function TarefaForm({ turmas, defaultAtribuicaoId }: TarefaFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await criarTarefaEscolar(new FormData(event.currentTarget));
      if (result.error) setError(result.error);
      else {
        event.currentTarget.reset();
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="font-semibold text-slate-900">Nova tarefa / trabalho</h3>
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <select
        name="atribuicao_id"
        required
        defaultValue={defaultAtribuicaoId ?? ""}
        className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
      >
        <option value="">Selecione a turma...</option>
        {turmas.map((turma) => (
          <option key={turma.id} value={turma.id}>
            {turma.label}
          </option>
        ))}
      </select>

      <input
        name="titulo"
        required
        placeholder="Título da tarefa"
        className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
      />

      <textarea
        name="descricao"
        required
        rows={3}
        placeholder="Instruções para os estudantes..."
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />

      <input
        name="data_entrega"
        type="date"
        required
        className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
      />

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399] disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          "Publicar tarefa"
        )}
      </button>
    </form>
  );
}

export function TarefaListItem({ tarefa }: { tarefa: TarefaEscolar }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const hoje = new Date().toISOString().slice(0, 10);
  const atrasada = tarefa.dataEntrega < hoje;

  async function handleDelete() {
    if (!confirm(`Excluir a tarefa "${tarefa.titulo}"?`)) return;
    setLoading(true);
    await excluirTarefaEscolar(tarefa.id);
    router.refresh();
    setLoading(false);
  }

  return (
    <li className="rounded-xl border border-slate-100 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{tarefa.titulo}</p>
          <p className="text-slate-600">
            {tarefa.disciplina} — {tarefa.turma} ({tarefa.serie})
          </p>
          <p
            className={`mt-1 text-xs font-medium ${
              atrasada ? "text-rose-600" : "text-slate-500"
            }`}
          >
            Entrega: {formatDate(tarefa.dataEntrega)}
            {atrasada ? " (prazo encerrado)" : ""}
          </p>
          <p className="mt-2 text-slate-700">{tarefa.descricao}</p>
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
