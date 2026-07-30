"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { criarAluno, atualizarAluno } from "@/actions/secretaria";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCpf } from "@/lib/utils";

type TurmaOption = { id: string; label: string };

type AlunoFormProps = {
  mode: "create" | "edit";
  alunoId?: string;
  defaultValues?: {
    nome: string;
    cpf: string;
    data_nascimento: string;
    nome_mae: string;
    nis: string;
  };
  turmas?: TurmaOption[];
  showTurmaSelect?: boolean;
};

export function AlunoForm({
  mode,
  alunoId,
  defaultValues,
  turmas = [],
  showTurmaSelect = mode === "create",
}: AlunoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [cpf, setCpf] = useState(defaultValues?.cpf ?? "");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setMessage(null);

    const result =
      mode === "create"
        ? await criarAluno(formData)
        : await atualizarAluno(alunoId!, formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      if (result.alunoId) {
        router.push(`/gestor/alunos/${result.alunoId}`);
      }
      return;
    }

    if (mode === "edit") {
      setMessage("Dados atualizados com sucesso.");
      router.refresh();
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Field label="Nome completo" name="nome" required defaultValue={defaultValues?.nome} />

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

      <Field
        label="Data de nascimento"
        name="data_nascimento"
        type="date"
        required
        defaultValue={defaultValues?.data_nascimento}
      />

      <Field
        label="Nome da mãe / responsável"
        name="nome_mae"
        required
        defaultValue={defaultValues?.nome_mae}
      />

      <Field
        label="NIS"
        name="nis"
        placeholder="Número de Identificação Social"
        defaultValue={defaultValues?.nis}
      />

      {showTurmaSelect && turmas.length > 0 ? (
        <div>
          <label htmlFor="turma_id" className="text-sm font-medium text-slate-700">
            Matricular na turma (opcional)
          </label>
          <select
            id="turma_id"
            name="turma_id"
            className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            defaultValue=""
          >
            <option value="">Matricular depois</option>
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

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
        ) : mode === "create" ? (
          "Cadastrar aluno"
        ) : (
          "Salvar alterações"
        )}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
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
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2"
      />
    </div>
  );
}
