"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { excluirAtribuicao } from "@/actions/diario";
import { Button } from "@/components/ui/button";

type AtribuicaoListItemProps = {
  atribuicao: {
    id: string;
    professorNome: string;
    disciplinaNome: string;
    turmaNome: string;
    turmaSerie: string;
  };
};

export function AtribuicaoListItem({ atribuicao }: AtribuicaoListItemProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (
      !confirm(
        `Remover a atribuição de ${atribuicao.professorNome} em ${atribuicao.disciplinaNome} (${atribuicao.turmaNome})?`,
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    const result = await excluirAtribuicao(atribuicao.id);

    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <li className="rounded-xl border border-slate-100 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">
            {atribuicao.professorNome} — {atribuicao.disciplinaNome}
          </p>
          <p className="text-slate-600">
            {atribuicao.turmaNome} ({atribuicao.turmaSerie})
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          disabled={loading}
          className="h-8 shrink-0 px-2.5 text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
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

      {error ? (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </li>
  );
}
