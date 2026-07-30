"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

import { gerarPlanoCurso } from "@/actions/planos-curso";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { NivelEnsinoPlano } from "@/lib/professor-planos";

type AtribuicaoOption = {
  id: string;
  label: string;
  disciplina: string;
  serie: string;
};

type PlanoCursoGerarFormProps = {
  nivel: NivelEnsinoPlano;
  nivelLabel: string;
  seriesOptions: readonly string[];
  atribuicoes: AtribuicaoOption[];
};

export function PlanoCursoGerarForm({
  nivel,
  nivelLabel,
  seriesOptions,
  atribuicoes,
}: PlanoCursoGerarFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disciplina, setDisciplina] = useState("");
  const [serie, setSerie] = useState(seriesOptions[0] ?? "");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("nivel", nivel);

    const result = await gerarPlanoCurso(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  function handleAtribuicaoChange(value: string) {
    const selected = atribuicoes.find((item) => item.id === value);
    if (selected) {
      setDisciplina(selected.disciplina);
      setSerie(selected.serie);
    }
  }

  return (
    <Card>
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E3F2FD] text-[#1E7BB8]">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <CardTitle>Novo Plano de Curso — {nivelLabel}</CardTitle>
          <CardDescription>
            Gere a estrutura anual da disciplina alinhada à BNCC.
          </CardDescription>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <input type="hidden" name="nivel" value={nivel} />

        <div>
          <label htmlFor="titulo" className="text-sm font-medium text-slate-700">
            Título do curso
          </label>
          <Input
            id="titulo"
            name="titulo"
            required
            minLength={5}
            placeholder="Ex.: Matemática — 5º ano"
            className="mt-2"
            disabled={loading}
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
            value={serie}
            onChange={(event) => setSerie(event.target.value)}
            disabled={loading}
            className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            {seriesOptions.map((item) => (
              <option key={item} value={item}>
                {item}
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
              disabled={loading}
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
            Disciplina
          </label>
          <Input
            id="disciplina"
            name="disciplina"
            required
            value={disciplina}
            onChange={(event) => setDisciplina(event.target.value)}
            placeholder="Ex.: Matemática"
            className="mt-2"
            disabled={loading}
          />
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Gerando plano de curso...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              Gerar plano de curso
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
