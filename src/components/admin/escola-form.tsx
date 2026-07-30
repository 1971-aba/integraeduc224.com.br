"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { criarEscola } from "@/actions/admin-sme";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function EscolaForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setMessage(null);

    const result = await criarEscola(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Escola cadastrada com sucesso.");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Card>
      <CardTitle>Nova escola</CardTitle>
      <CardDescription>Cadastre uma unidade escolar da rede</CardDescription>

      <form action={handleSubmit} className="mt-6 space-y-4">
        <Field label="Nome da escola" name="nome" required placeholder="Ex.: EMEF Maria Silva" />
        <Field label="INEP" name="inep" placeholder="Código INEP (opcional)" />
        <Field label="Endereço" name="endereco" placeholder="Logradouro, bairro (opcional)" />

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}
        {message ? (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>
        ) : null}

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            "Cadastrar escola"
          )}
        </Button>
      </form>
    </Card>
  );
}

function Field({
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
      <input
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
      />
    </div>
  );
}
