"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { criarTurma } from "@/actions/gestor-estrutura";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatTurnoLabel } from "@/lib/dashboard-utils";

type Option = { id: string; label: string };

type TurmaFormProps = {
  anosLetivos: Option[];
  escolas?: Option[];
  defaultAnoLetivoId?: string;
  defaultEscolaId?: string;
};

const turnoOptions = [
  { value: "manha", label: formatTurnoLabel("manha") },
  { value: "tarde", label: formatTurnoLabel("tarde") },
  { value: "noite", label: formatTurnoLabel("noite") },
  { value: "integral", label: formatTurnoLabel("integral") },
];

export function TurmaForm({
  anosLetivos,
  escolas = [],
  defaultAnoLetivoId,
  defaultEscolaId,
}: TurmaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setMessage(null);

    const result = await criarTurma(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Turma cadastrada com sucesso.");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Card>
      <CardTitle>Nova turma</CardTitle>
      <CardDescription>
        Cadastre turmas da unidade escolar para matrículas e atribuições
      </CardDescription>

      <form action={handleSubmit} className="mt-6 space-y-4">
        {escolas.length > 0 ? (
          <Field label="Escola" name="escola_id" options={escolas} />
        ) : defaultEscolaId ? (
          <input type="hidden" name="escola_id" value={defaultEscolaId} />
        ) : null}

        <div>
          <label htmlFor="nome" className="text-sm font-medium text-slate-700">
            Nome da turma
          </label>
          <input
            id="nome"
            name="nome"
            required
            placeholder="Ex.: 5º A"
            className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="serie" className="text-sm font-medium text-slate-700">
            Série
          </label>
          <input
            id="serie"
            name="serie"
            required
            placeholder="Ex.: 5º ano"
            className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="turno" className="text-sm font-medium text-slate-700">
            Turno
          </label>
          <select
            id="turno"
            name="turno"
            required
            defaultValue=""
            className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="" disabled>
              Selecione...
            </option>
            {turnoOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Field
          label="Ano letivo"
          name="ano_letivo_id"
          options={anosLetivos}
          defaultValue={defaultAnoLetivoId}
        />

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

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            "Cadastrar turma"
          )}
        </Button>
      </form>
    </Card>
  );
}

function Field({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: Option[];
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={name}
        name={name}
        required
        defaultValue={defaultValue ?? ""}
        className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
      >
        <option value="" disabled>
          Selecione...
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
