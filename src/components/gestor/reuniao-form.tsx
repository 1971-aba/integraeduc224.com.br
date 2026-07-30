"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { criarReuniaoEscolar } from "@/actions/gestor-administracao";
import {
  REUNIAO_TIPO_LABEL,
  type ReuniaoTipo,
} from "@/lib/gestor-modulos-types";

export function ReuniaoForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await criarReuniaoEscolar(formData);
      if (result.error) {
        setError(result.error);
      } else {
        event.currentTarget.reset();
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
    >
      <h3 className="text-base font-semibold text-slate-900">Nova reunião</h3>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div>
        <label htmlFor="titulo" className="mb-1 block text-sm font-medium">
          Título
        </label>
        <input
          id="titulo"
          name="titulo"
          required
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tipo" className="mb-1 block text-sm font-medium">
            Tipo
          </label>
          <select
            id="tipo"
            name="tipo"
            defaultValue="reuniao_pedagogica"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          >
            {(Object.keys(REUNIAO_TIPO_LABEL) as ReuniaoTipo[]).map((tipo) => (
              <option key={tipo} value={tipo}>
                {REUNIAO_TIPO_LABEL[tipo]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="data" className="mb-1 block text-sm font-medium">
            Data
          </label>
          <input
            id="data"
            name="data"
            type="date"
            required
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="hora" className="mb-1 block text-sm font-medium">
            Horário
          </label>
          <input
            id="hora"
            name="hora"
            type="time"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="local" className="mb-1 block text-sm font-medium">
            Local
          </label>
          <input
            id="local"
            name="local"
            placeholder="Ex.: Sala dos professores"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="descricao" className="mb-1 block text-sm font-medium">
          Descrição (opcional)
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

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
          "Agendar reunião"
        )}
      </button>
    </form>
  );
}
