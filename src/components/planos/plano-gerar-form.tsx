"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

import { gerarPlanoAula } from "@/actions/planos-aula";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SERIES_ESCOLARES } from "@/lib/ai/config";

type AtribuicaoOption = {
  id: string;
  label: string;
  disciplina: string;
};

type PlanoGerarFormProps = {
  atribuicoes: AtribuicaoOption[];
  aiDisponivel: boolean;
  providerLabel: string | null;
  isDemoMode?: boolean;
};

export function PlanoGerarForm({
  atribuicoes,
  aiDisponivel,
  providerLabel,
  isDemoMode = false,
}: PlanoGerarFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disciplina, setDisciplina] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await gerarPlanoAula(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  function handleAtribuicaoChange(value: string) {
    const selected = atribuicoes.find((item) => item.id === value);
    if (selected) {
      setDisciplina(selected.disciplina);
    }
  }

  return (
    <Card>
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <CardTitle>Gerar plano com IA</CardTitle>
          <CardDescription>
            {isDemoMode
              ? "Modo demonstração ativo: gera plano estruturado (BNCC) sem API externa. Para IA completa, configure GEMINI_API_KEY ou OPENAI_API_KEY."
              : aiDisponivel
                ? `Assistente ativo via ${providerLabel}. O plano será alinhado à BNCC.`
                : "Configure OPENAI_API_KEY ou GEMINI_API_KEY para habilitar a IA."}
          </CardDescription>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tema" className="text-sm font-medium text-slate-700">
            Tema da aula
          </label>
          <Input
            id="tema"
            name="tema"
            placeholder="Ex.: Frações equivalentes no cotidiano"
            required
            minLength={5}
            className="mt-2"
            disabled={!aiDisponivel || loading}
          />
        </div>

        <div>
          <label htmlFor="serie" className="text-sm font-medium text-slate-700">
            Ano / Série
          </label>
          <select
            id="serie"
            name="serie"
            required
            disabled={!aiDisponivel || loading}
            className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              Selecione...
            </option>
            {SERIES_ESCOLARES.map((serie) => (
              <option key={serie} value={serie}>
                {serie}
              </option>
            ))}
          </select>
        </div>

        {atribuicoes.length > 0 ? (
          <div>
            <label
              htmlFor="atribuicao_id"
              className="text-sm font-medium text-slate-700"
            >
              Vincular à turma (opcional)
            </label>
            <select
              id="atribuicao_id"
              name="atribuicao_id"
              disabled={!aiDisponivel || loading}
              className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              defaultValue=""
              onChange={(event) => handleAtribuicaoChange(event.target.value)}
            >
              <option value="">Nenhuma</option>
              {atribuicoes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <label
            htmlFor="disciplina"
            className="text-sm font-medium text-slate-700"
          >
            Disciplina (opcional)
          </label>
          <Input
            id="disciplina"
            name="disciplina"
            value={disciplina}
            onChange={(event) => setDisciplina(event.target.value)}
            placeholder="Ex.: Matemática"
            className="mt-2"
            disabled={!aiDisponivel || loading}
          />
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={!aiDisponivel || loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Gerando plano com IA...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              Gerar plano de aula
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
