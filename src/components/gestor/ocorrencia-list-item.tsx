"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { excluirOcorrencia } from "@/actions/gestor-administracao";
import { Button } from "@/components/ui/button";
import {
  OCORRENCIA_TIPO_LABEL,
  type OcorrenciaEscolar,
} from "@/lib/gestor-modulos-types";

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

export function OcorrenciaListItem({
  ocorrencia,
}: {
  ocorrencia: OcorrenciaEscolar;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm(`Excluir a ocorrência "${ocorrencia.titulo}"?`)) return;

    setLoading(true);
    setError(null);

    const result = await excluirOcorrencia(ocorrencia.id);

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
          <p className="font-medium text-slate-900">{ocorrencia.titulo}</p>
          <p className="text-slate-600">
            {OCORRENCIA_TIPO_LABEL[ocorrencia.tipo] ?? ocorrencia.tipo}
            {ocorrencia.alunoNome ? ` — ${ocorrencia.alunoNome}` : ""}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatDate(ocorrencia.data)}
          </p>
          <p className="mt-2 text-slate-600">{ocorrencia.descricao}</p>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="h-8 px-2 text-rose-600 hover:bg-rose-50"
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

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </li>
  );
}
