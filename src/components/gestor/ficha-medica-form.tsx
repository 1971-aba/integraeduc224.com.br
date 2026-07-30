"use client";

import { Loader2, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { salvarFichaMedica } from "@/actions/gestor-ficha-medica";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TIPOS_SANGUINEOS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export type FichaMedicaValores = {
  tipo_sanguineo: string;
  alergias: string;
  medicamentos: string;
  restricoes_alimentares: string;
  condicoes_saude: string;
  plano_saude: string;
  unidade_saude: string;
  contato_nome: string;
  contato_telefone: string;
  observacoes: string;
};

type FichaMedicaFormProps = {
  alunoId: string;
  valores: FichaMedicaValores;
  atualizadaEm: string | null;
};

export function FichaMedicaForm({
  alunoId,
  valores,
  atualizadaEm,
}: FichaMedicaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setMessage(null);

    const result = await salvarFichaMedica(alunoId, formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setMessage("Ficha médica salva com sucesso.");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="tipo_sanguineo"
            className="text-sm font-medium text-slate-700"
          >
            Tipo sanguíneo
          </label>
          <select
            id="tipo_sanguineo"
            name="tipo_sanguineo"
            defaultValue={valores.tipo_sanguineo}
            className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
          >
            <option value="">Não informado</option>
            {TIPOS_SANGUINEOS.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        <Campo
          label="Plano de saúde"
          name="plano_saude"
          defaultValue={valores.plano_saude}
          placeholder="SUS, convênio, etc."
        />

        <Campo
          label="Contato de emergência"
          name="contato_nome"
          defaultValue={valores.contato_nome}
          placeholder="Nome do responsável"
        />

        <Campo
          label="Telefone de emergência"
          name="contato_telefone"
          type="tel"
          defaultValue={valores.contato_telefone}
          placeholder="(00) 00000-0000"
        />

        <div className="sm:col-span-2">
          <Campo
            label="Unidade de saúde de referência"
            name="unidade_saude"
            defaultValue={valores.unidade_saude}
            placeholder="Posto de saúde ou hospital mais próximo"
          />
        </div>
      </div>

      <AreaTexto
        label="Alergias"
        name="alergias"
        defaultValue={valores.alergias}
        placeholder="Medicamentos, alimentos, picadas de insetos..."
      />

      <AreaTexto
        label="Medicamentos de uso contínuo"
        name="medicamentos"
        defaultValue={valores.medicamentos}
        placeholder="Nome do medicamento, dosagem e horário"
      />

      <AreaTexto
        label="Restrições alimentares"
        name="restricoes_alimentares"
        defaultValue={valores.restricoes_alimentares}
        placeholder="Intolerâncias e alimentos proibidos (importante para a merenda)"
      />

      <AreaTexto
        label="Condições de saúde e deficiências"
        name="condicoes_saude"
        defaultValue={valores.condicoes_saude}
        placeholder="Asma, epilepsia, diabetes, TEA, deficiência física..."
      />

      <AreaTexto
        label="Observações"
        name="observacoes"
        defaultValue={valores.observacoes}
        placeholder="Qualquer informação que a escola precise saber em uma emergência"
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

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <p className="text-xs text-slate-500">
          {atualizadaEm
            ? `Última atualização: ${atualizadaEm}`
            : "Ficha ainda não preenchida."}
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
            Imprimir
          </Button>
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
              "Salvar ficha"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Campo({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
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
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2"
      />
    </div>
  );
}

function AreaTexto({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={3}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      />
    </div>
  );
}
