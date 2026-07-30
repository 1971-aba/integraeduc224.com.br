"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { criarDisciplina } from "@/actions/gestor-estrutura";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function DisciplinaForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setMessage(null);

    const result = await criarDisciplina(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Disciplina cadastrada com sucesso.");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Card>
      <CardTitle>Nova disciplina</CardTitle>
      <CardDescription>
        Componentes curriculares disponíveis para atribuição aos professores
      </CardDescription>

      <form action={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="nome_disciplina" className="text-sm font-medium text-slate-700">
            Nome da disciplina
          </label>
          <input
            id="nome_disciplina"
            name="nome"
            required
            placeholder="Ex.: Língua Portuguesa"
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

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            "Cadastrar disciplina"
          )}
        </Button>
      </form>
    </Card>
  );
}
