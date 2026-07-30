"use client";

import { Loader2, Save, Trash2 } from "lucide-react";
import { useState } from "react";

import { excluirPlanoCurso, salvarPlanoCurso } from "@/actions/planos-curso";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { NivelEnsinoPlano } from "@/lib/professor-planos";

type PlanoCursoEditorProps = {
  planoId: string;
  titulo: string;
  disciplina: string;
  serie: string;
  nivel: NivelEnsinoPlano;
  conteudoInicial: string;
};

export function PlanoCursoEditor({
  planoId,
  titulo,
  disciplina,
  serie,
  nivel,
  conteudoInicial,
}: PlanoCursoEditorProps) {
  const [conteudo, setConteudo] = useState(conteudoInicial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const result = await salvarPlanoCurso(planoId, conteudo);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Plano de curso salvo com sucesso.");
    }

    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Deseja excluir este plano de curso?")) return;

    setDeleting(true);
    const result = await excluirPlanoCurso(planoId, nivel);
    if (result?.error) {
      setError(result.error);
      setDeleting(false);
    }
  }

  return (
    <Card>
      <CardTitle>{titulo}</CardTitle>
      <CardDescription>
        {disciplina} — {serie}
      </CardDescription>

      <textarea
        value={conteudo}
        onChange={(event) => setConteudo(event.target.value)}
        rows={24}
        className="mt-6 w-full rounded-lg border border-slate-200 bg-white p-4 font-mono text-sm leading-relaxed text-slate-800"
      />

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {message}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" onClick={handleSave} disabled={saving || deleting}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" aria-hidden="true" />
              Salvar
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleDelete}
          disabled={saving || deleting}
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
    </Card>
  );
}
