"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { cadastrarExAluno } from "@/actions/gestor-ex-aluno";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MOTIVOS_SAIDA_EX_ALUNO,
} from "@/lib/alunos-escolares-config";
import { SERIES_ESCOLARES } from "@/lib/ai/config";
import { formatCpf } from "@/lib/utils";

export function ExAlunoForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cpf, setCpf] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await cadastrarExAluno(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Campo label="Nome completo" name="nome" required />

      <div>
        <label htmlFor="cpf" className="text-sm font-medium text-slate-700">
          CPF
        </label>
        <Input
          id="cpf"
          name="cpf"
          value={cpf}
          onChange={(event) => setCpf(formatCpf(event.target.value))}
          placeholder="000.000.000-00"
          className="mt-2"
        />
      </div>

      <Campo
        label="Data de nascimento"
        name="data_nascimento"
        type="date"
        required
      />

      <Campo
        label="Nome da mãe / responsável"
        name="nome_mae"
        required
      />

      <Campo
        label="NIS"
        name="nis"
        placeholder="Número de Identificação Social"
      />

      <div>
        <label
          htmlFor="ultima_serie"
          className="text-sm font-medium text-slate-700"
        >
          Última série cursada
        </label>
        <select
          id="ultima_serie"
          name="ultima_serie"
          required
          defaultValue=""
          className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="" disabled>
            Selecione a série
          </option>
          {SERIES_ESCOLARES.map((serie) => (
            <option key={serie} value={serie}>
              {serie}
            </option>
          ))}
        </select>
      </div>

      <Campo
        label="Ano de conclusão ou saída"
        name="ano_conclusao"
        type="number"
        min={1950}
        max={new Date().getFullYear()}
        required
        placeholder={String(new Date().getFullYear() - 1)}
      />

      <div>
        <label
          htmlFor="motivo_saida"
          className="text-sm font-medium text-slate-700"
        >
          Motivo da saída
        </label>
        <select
          id="motivo_saida"
          name="motivo_saida"
          required
          defaultValue=""
          className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="" disabled>
            Selecione o motivo
          </option>
          {Object.entries(MOTIVOS_SAIDA_EX_ALUNO).map(([chave, label]) => (
            <option key={chave} value={chave}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Salvando...
          </>
        ) : (
          "Cadastrar ex-aluno"
        )}
      </Button>
    </form>
  );
}

function Campo({
  label,
  name,
  type = "text",
  required,
  placeholder,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        className="mt-2"
      />
    </div>
  );
}
