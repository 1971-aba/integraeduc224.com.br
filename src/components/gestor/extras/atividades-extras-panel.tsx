"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  criarAtividadeExtra,
  excluirAtividadeExtra,
} from "@/actions/gestor-extras";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { AtividadeExtra } from "@/lib/extras-config";
import type { TipoAtividadeExtra } from "@/types/database";

type AtividadesExtrasPanelProps = {
  tipo: TipoAtividadeExtra;
  atividades: AtividadeExtra[];
};

export function AtividadesExtrasPanel({
  tipo,
  atividades,
}: AtividadesExtrasPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const nomeSingular =
    tipo === "aee" ? "atendimento" : "atividade complementar";

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setMessage(null);
    formData.set("tipo", tipo);

    const result = await criarAtividadeExtra(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Atividade cadastrada com sucesso.");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardTitle>Nova atividade</CardTitle>
        <CardDescription>
          Cadastre um {nomeSingular} ofertado pela escola
        </CardDescription>

        <form action={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="nome"
              className="text-sm font-medium text-slate-700"
            >
              Nome da atividade
            </label>
            <input
              id="nome"
              name="nome"
              required
              placeholder={
                tipo === "aee"
                  ? "Ex.: Atendimento em sala de recursos"
                  : "Ex.: Reforço de Matemática"
              }
              className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="descricao"
              className="text-sm font-medium text-slate-700"
            >
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="carga_horaria_semanal"
              className="text-sm font-medium text-slate-700"
            >
              Carga horária semanal (horas)
            </label>
            <input
              id="carga_horaria_semanal"
              name="carga_horaria_semanal"
              type="number"
              min={1}
              max={40}
              className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            />
          </div>

          {error ? (
            <p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          {message ? (
            <p
              className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700"
              role="status"
            >
              {message}
            </p>
          ) : null}

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Salvando...
              </>
            ) : (
              "Cadastrar atividade"
            )}
          </Button>
        </form>
      </Card>

      <Card>
        <CardTitle>Atividades cadastradas</CardTitle>
        <CardDescription>
          {atividades.length} atividade(s) registrada(s)
        </CardDescription>

        {atividades.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            Nenhuma atividade cadastrada ainda.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {atividades.map((atividade) => (
              <AtividadeItem key={atividade.id} atividade={atividade} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function AtividadeItem({ atividade }: { atividade: AtividadeExtra }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm(`Excluir a atividade "${atividade.nome}"?`)) return;

    setLoading(true);
    setError(null);

    const result = await excluirAtividadeExtra(atividade.id);

    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <li className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{atividade.nome}</p>
          {atividade.descricao ? (
            <p className="mt-1 text-sm text-slate-600">{atividade.descricao}</p>
          ) : null}
          <p className="mt-2 text-xs text-slate-500">
            {atividade.cargaHorariaSemanal
              ? `${atividade.cargaHorariaSemanal}h semanais • `
              : null}
            {atividade.turmas} turma(s) vinculada(s)
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          disabled={loading}
          className="h-8 px-2.5 text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
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
