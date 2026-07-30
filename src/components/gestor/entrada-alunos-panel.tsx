"use client";

import { Loader2, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { registrarEntradaAluno } from "@/actions/gestor-entrada-feriados";
import { Button } from "@/components/ui/button";
import type { EntradaAluno } from "@/lib/gestor-modulos-types";

type EntradaAlunoButtonProps = {
  matriculaId: string;
  alunoNome: string;
  jaRegistrado: boolean;
};

export function EntradaAlunoButton({
  matriculaId,
  alunoNome,
  jaRegistrado,
}: EntradaAlunoButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegistrar() {
    setLoading(true);
    setError(null);

    const result = await registrarEntradaAluno(matriculaId);

    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setLoading(false);
  }

  if (jaRegistrado) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
        <UserCheck className="mr-1 h-3 w-3" />
        Entrada registrada
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        className="h-8 px-3 text-xs"
        disabled={loading}
        onClick={handleRegistrar}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Registrar entrada"
        )}
      </Button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}

export function EntradasRegistradasList({
  entradas,
}: {
  entradas: EntradaAluno[];
}) {
  if (entradas.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Nenhuma entrada registrada hoje.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {entradas.map((entrada) => (
        <li
          key={entrada.id}
          className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
        >
          <div>
            <p className="font-medium text-slate-900">{entrada.alunoNome}</p>
            <p className="text-slate-600">
              {entrada.turmaNome} ({entrada.turmaSerie})
            </p>
          </div>
          <span className="text-xs text-slate-500">
            {entrada.hora.slice(0, 5)}
          </span>
        </li>
      ))}
    </ul>
  );
}
