"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  excluirRotaOnibus,
  salvarRotaOnibus,
} from "@/actions/gestor-estrutura-outros";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RotaOnibus } from "@/lib/estrutura-outros-config";

type RotasOnibusPanelProps = {
  rotas: RotaOnibus[];
  modo: "cadastro" | "consulta";
};

export function RotasOnibusPanel({ rotas, modo }: RotasOnibusPanelProps) {
  const router = useRouter();
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSalvar(formData: FormData) {
    setProcessando(true);
    setErro(null);

    const result = await salvarRotaOnibus(formData);
    setProcessando(false);

    if (result?.error) {
      setErro(result.error);
      return;
    }

    router.refresh();
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir esta rota?")) return;

    setProcessando(true);
    setErro(null);

    const result = await excluirRotaOnibus(id);
    setProcessando(false);

    if (result?.error) setErro(result.error);
    else router.refresh();
  }

  return (
    <div
      className={
        modo === "cadastro"
          ? "grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]"
          : "space-y-4"
      }
    >
      {modo === "cadastro" ? (
        <form
          action={handleSalvar}
          className="h-fit space-y-3 rounded-xl border border-slate-200 bg-white p-6"
        >
          <h3 className="font-semibold text-slate-900">Nova rota</h3>

          <Campo label="Nome da rota" name="nome" required />
          <Campo label="Turno" name="turno" placeholder="Manhã, tarde..." />
          <Campo label="Motorista" name="motorista" />
          <Campo label="Monitor(a)" name="monitor" />
          <div>
            <label
              htmlFor="observacoes"
              className="text-sm font-medium text-slate-700"
            >
              Observações / trajeto
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          {erro ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {erro}
            </p>
          ) : null}

          <Button type="submit" disabled={processando}>
            {processando ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              "Cadastrar rota"
            )}
          </Button>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Rota</th>
              <th className="px-4 py-3 font-medium">Turno</th>
              <th className="px-4 py-3 font-medium">Motorista</th>
              <th className="px-4 py-3 font-medium">Monitor(a)</th>
              {modo === "cadastro" ? (
                <th className="px-4 py-3 font-medium" />
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rotas.map((rota) => (
              <tr
                key={rota.id}
                className="border-b border-slate-100 last:border-b-0"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{rota.nome}</p>
                  {rota.observacoes ? (
                    <p className="text-xs text-slate-500">{rota.observacoes}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {rota.turno ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {rota.motorista ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {rota.monitor ?? "—"}
                </td>
                {modo === "cadastro" ? (
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleExcluir(rota.id)}
                      disabled={processando}
                      aria-label={`Excluir ${rota.nome}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </td>
                ) : null}
              </tr>
            ))}
            {rotas.length === 0 ? (
              <tr>
                <td
                  colSpan={modo === "cadastro" ? 5 : 4}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Nenhuma rota cadastrada.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Campo({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <Input
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-2"
      />
    </div>
  );
}
