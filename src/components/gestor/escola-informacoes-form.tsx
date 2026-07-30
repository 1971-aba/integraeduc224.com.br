"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { salvarInformacoesEscola } from "@/actions/gestor-estrutura-outros";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EscolaInformacoes } from "@/lib/estrutura-outros-config";

type EscolaInformacoesFormProps = {
  escola: {
    nome: string;
    inep: string | null;
    endereco: string | null;
  };
  informacoes: EscolaInformacoes | null;
};

export function EscolaInformacoesForm({
  escola,
  informacoes,
}: EscolaInformacoesFormProps) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function handleSalvar(formData: FormData) {
    setSalvando(true);
    setErro(null);
    setSucesso(false);

    const result = await salvarInformacoesEscola(formData);
    setSalvando(false);

    if (result?.error) {
      setErro(result.error);
      return;
    }

    setSucesso(true);
    router.refresh();
  }

  return (
    <form action={handleSalvar} className="space-y-4">
      <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
        <p className="font-medium text-slate-900">{escola.nome}</p>
        <p className="text-slate-600">
          INEP: {escola.inep ?? "—"} · Endereço: {escola.endereco ?? "—"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          label="Telefone"
          name="telefone"
          defaultValue={informacoes?.telefone ?? ""}
        />
        <Campo
          label="E-mail institucional"
          name="email"
          type="email"
          defaultValue={informacoes?.email ?? ""}
        />
        <Campo
          label="Diretor(a)"
          name="diretor_nome"
          defaultValue={informacoes?.diretorNome ?? ""}
        />
        <Campo
          label="Vice-diretor(a)"
          name="vice_diretor_nome"
          defaultValue={informacoes?.viceDiretorNome ?? ""}
        />
        <Campo
          label="Secretário(a) escolar"
          name="secretario_nome"
          defaultValue={informacoes?.secretarioNome ?? ""}
        />
        <Campo
          label="Horário de funcionamento"
          name="horario_funcionamento"
          defaultValue={informacoes?.horarioFuncionamento ?? ""}
          placeholder="Ex.: 07h às 17h"
        />
      </div>

      <div>
        <label
          htmlFor="observacoes"
          className="text-sm font-medium text-slate-700"
        >
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          defaultValue={informacoes?.observacoes ?? ""}
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      {erro ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      ) : null}
      {sucesso ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          Informações salvas com sucesso.
        </p>
      ) : null}

      <Button type="submit" disabled={salvando}>
        {salvando ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          "Salvar informações"
        )}
      </Button>
    </form>
  );
}

function Campo({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
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
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2"
      />
    </div>
  );
}
