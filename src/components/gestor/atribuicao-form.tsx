"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { criarAtribuicao } from "@/actions/diario";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type Option = { id: string; label: string };

type AtribuicaoFormProps = {
  professores: Option[];
  disciplinas: Option[];
  turmas: Option[];
  anoLetivoId: string;
};

export function AtribuicaoForm({
  professores,
  disciplinas,
  turmas,
  anoLetivoId,
}: AtribuicaoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setMessage(null);
    formData.set("ano_letivo_id", anoLetivoId);

    const result = await criarAtribuicao(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Atribuição criada com sucesso.");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Card>
      <CardTitle>Nova atribuição</CardTitle>
      <CardDescription>
        Vincule professor, disciplina e turma
      </CardDescription>

      <form action={handleSubmit} className="mt-6 space-y-4">
        <Field label="Professor" name="professor_id" options={professores} />
        <Field label="Disciplina" name="disciplina_id" options={disciplinas} />
        <Field label="Turma" name="turma_id" options={turmas} />

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

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            "Criar atribuição"
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
}: {
  label: string;
  name: string;
  options: Option[];
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
        className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
        defaultValue=""
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
