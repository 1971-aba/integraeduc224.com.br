"use client";

import { Loader2, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { atualizarEscola } from "@/actions/admin-sme";
import { Button } from "@/components/ui/button";

type EscolaListItemProps = {
  escola: {
    id: string;
    nome: string;
    inep: string | null;
    endereco: string | null;
    ativa: boolean;
  };
};

export function EscolaListItem({ escola }: EscolaListItemProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await atualizarEscola(escola.id, formData);

    if (result.error) {
      setError(result.error);
    } else {
      setEditing(false);
      router.refresh();
    }

    setLoading(false);
  }

  if (editing) {
    return (
      <tr className="border-b border-blue-100 bg-blue-50/40">
        <td colSpan={4} className="px-3 py-4">
          <form action={handleUpdate} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-700">Nome</label>
              <input
                name="nome"
                required
                defaultValue={escola.nome}
                className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">INEP</label>
              <input
                name="inep"
                defaultValue={escola.inep ?? ""}
                className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-700">Endereço</label>
              <input
                name="endereco"
                defaultValue={escola.endereco ?? ""}
                className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="ativa"
                defaultChecked={escola.ativa}
                className="h-4 w-4 rounded border-slate-300"
              />
              Escola ativa
            </label>

            {error ? (
              <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            ) : null}

            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={loading} className="h-9 px-3 text-xs">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  "Salvar"
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={loading}
                className="h-9 px-3 text-xs"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                }}
              >
                <X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Cancelar
              </Button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-slate-100">
      <td className="px-3 py-3 font-medium text-slate-900">{escola.nome}</td>
      <td className="px-3 py-3 text-slate-600">{escola.inep ?? "—"}</td>
      <td className="px-3 py-3 text-slate-600">{escola.endereco ?? "—"}</td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={
              escola.ativa
                ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                : "rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
            }
          >
            {escola.ativa ? "Ativa" : "Inativa"}
          </span>
          <Button
            type="button"
            variant="secondary"
            className="h-8 px-2.5 text-xs"
            onClick={() => {
              setEditing(true);
              setError(null);
            }}
          >
            <Pencil className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            Editar
          </Button>
        </div>
      </td>
    </tr>
  );
}
