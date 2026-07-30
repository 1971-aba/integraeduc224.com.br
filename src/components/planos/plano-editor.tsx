"use client";

import { Download, Loader2, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { excluirPlanoAula, salvarPlanoAula } from "@/actions/planos-aula";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type PlanoEditorProps = {
  planoId: string;
  tema: string;
  serie: string;
  disciplina: string | null;
  conteudoInicial: string;
};

export function PlanoEditor({
  planoId,
  tema,
  serie,
  disciplina,
  conteudoInicial,
}: PlanoEditorProps) {
  const [conteudo, setConteudo] = useState(conteudoInicial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const result = await salvarPlanoAula(planoId, conteudo);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Plano salvo com sucesso.");
    }

    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Deseja excluir este plano de aula?")) return;

    setDeleting(true);
    setError(null);
    await excluirPlanoAula(planoId);
  }

  return (
    <div className="space-y-4 pb-8">
      <Card>
        <CardTitle>{tema}</CardTitle>
        <CardDescription>
          {serie}
          {disciplina ? ` • ${disciplina}` : ""}
        </CardDescription>

        <p className="mt-4 text-sm text-slate-600">
          Revise, complemente ou adapte o texto gerado pela IA antes de exportar
          o PDF oficial.
        </p>
      </Card>

      <div>
        <label htmlFor="conteudo" className="text-sm font-medium text-slate-700">
          Conteúdo do plano
        </label>
        <textarea
          id="conteudo"
          value={conteudo}
          onChange={(event) => setConteudo(event.target.value)}
          rows={22}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        />
        <p className="mt-2 text-xs text-slate-500">{conteudo.length} caracteres</p>
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

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button type="button" onClick={handleSave} disabled={saving || deleting}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" aria-hidden="true" />
              Salvar alterações
            </>
          )}
        </Button>

        <Link href={`/api/planos/${planoId}/pdf`} target="_blank">
          <Button type="button" variant="secondary" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Exportar PDF
          </Button>
        </Link>

        <Button
          type="button"
          variant="ghost"
          onClick={handleDelete}
          disabled={saving || deleting}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          {deleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Excluindo...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Excluir
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
