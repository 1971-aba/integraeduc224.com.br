"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { salvarConteudo } from "@/actions/diario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateInput } from "@/lib/diario-utils";

type ConteudoFormProps = {
  atribuicaoId: string;
  dataInicial: string;
  descricaoInicial: string;
  diaLetivo: boolean;
};

export function ConteudoForm({
  atribuicaoId,
  dataInicial,
  descricaoInicial,
  diaLetivo,
}: ConteudoFormProps) {
  const router = useRouter();
  const [data, setData] = useState(dataInicial);
  const [descricao, setDescricao] = useState(descricaoInicial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const result = await salvarConteudo(atribuicaoId, data, descricao);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Conteúdo registrado com sucesso.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-24 sm:pb-0">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <label htmlFor="data-conteudo" className="text-sm font-medium text-slate-700">
          Data da aula
        </label>
        <Input
          id="data-conteudo"
          type="date"
          value={data}
          onChange={(event) => {
            const novaData = event.target.value;
            setData(novaData);
            router.push(`?data=${novaData}`);
          }}
          className="mt-2"
          required
        />
        <p className="mt-2 text-sm text-slate-500">
          {formatDateInput(data)}
          {!diaLetivo && data === dataInicial ? (
            <span className="ml-2 text-amber-700">— dia não letivo</span>
          ) : null}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <label
          htmlFor="descricao"
          className="text-sm font-medium text-slate-700"
        >
          Conteúdo ministrado
        </label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          rows={8}
          placeholder="Descreva os temas, habilidades BNCC e atividades realizadas..."
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          required
          minLength={10}
        />
        <p className="mt-2 text-xs text-slate-500">
          {descricao.length} caracteres (mínimo 10)
        </p>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
          {message}
        </p>
      ) : null}

      <Button type="submit" className="fixed bottom-20 left-4 right-4 z-10 sm:static sm:w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Salvando...
          </>
        ) : (
          "Salvar conteúdo"
        )}
      </Button>
    </form>
  );
}
