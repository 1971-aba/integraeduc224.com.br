"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  excluirLocalidade,
  salvarLocalidade,
} from "@/actions/gestor-estrutura-outros";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TIPO_LOCALIDADE_LABEL,
  ZONA_LOCALIDADE_LABEL,
  type LocalidadeEscola,
} from "@/lib/estrutura-outros-config";

type LocalidadesPanelProps = {
  localidades: LocalidadeEscola[];
};

export function LocalidadesPanel({ localidades }: LocalidadesPanelProps) {
  const router = useRouter();
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSalvar(formData: FormData) {
    setProcessando(true);
    setErro(null);

    const result = await salvarLocalidade(formData);
    setProcessando(false);

    if (result?.error) {
      setErro(result.error);
      return;
    }

    router.refresh();
  }

  async function handleExcluir(id: string) {
    setProcessando(true);
    setErro(null);

    const result = await excluirLocalidade(id);
    setProcessando(false);

    if (result?.error) setErro(result.error);
    else router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <form
        action={handleSalvar}
        className="h-fit space-y-3 rounded-xl border border-slate-200 bg-white p-6"
      >
        <h3 className="font-semibold text-slate-900">Novo local</h3>

        <Campo label="Nome" name="nome" required />

        <div>
          <label htmlFor="tipo" className="text-sm font-medium text-slate-700">
            Tipo
          </label>
          <select
            id="tipo"
            name="tipo"
            required
            defaultValue="bairro"
            className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
          >
            {Object.entries(TIPO_LOCALIDADE_LABEL).map(([chave, label]) => (
              <option key={chave} value={chave}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="zona" className="text-sm font-medium text-slate-700">
            Zona
          </label>
          <select
            id="zona"
            name="zona"
            required
            defaultValue="urbana"
            className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
          >
            {Object.entries(ZONA_LOCALIDADE_LABEL).map(([chave, label]) => (
              <option key={chave} value={chave}>
                {label}
              </option>
            ))}
          </select>
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
            "Cadastrar"
          )}
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Zona</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {localidades.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-100 last:border-b-0"
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  {item.nome}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {TIPO_LOCALIDADE_LABEL[item.tipo]}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {ZONA_LOCALIDADE_LABEL[item.zona]}
                </td>
                <td className="px-4 py-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleExcluir(item.id)}
                    disabled={processando}
                    aria-label={`Excluir ${item.nome}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </td>
              </tr>
            ))}
            {localidades.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Nenhum bairro ou povoado cadastrado.
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
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <Input id={name} name={name} required={required} className="mt-2" />
    </div>
  );
}
