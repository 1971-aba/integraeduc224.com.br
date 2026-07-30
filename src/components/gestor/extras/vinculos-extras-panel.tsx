"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  desvincularAlunoTurmaExtra,
  desvincularDisciplinaTurmaExtra,
  desvincularProfessorAtividade,
  vincularAlunoTurmaExtra,
  vincularDisciplinaTurmaExtra,
  vincularProfessorAtividade,
} from "@/actions/gestor-extras";
import { ExtrasEmptyState } from "@/components/gestor/extras/extras-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { VinculoTurmaExtra } from "@/lib/extras-config";

type VinculoKind = "alunos" | "disciplinas" | "professores";

const TEXTOS: Record<
  VinculoKind,
  { campo: string; nomeCampo: string; grupoCampo: string; vazio: string; adicionar: string }
> = {
  alunos: {
    campo: "Estudante",
    nomeCampo: "aluno_id",
    grupoCampo: "turma_extra_id",
    vazio: "Nenhum estudante vinculado.",
    adicionar: "Vincular estudante",
  },
  disciplinas: {
    campo: "Disciplina",
    nomeCampo: "disciplina_id",
    grupoCampo: "turma_extra_id",
    vazio: "Nenhuma disciplina vinculada.",
    adicionar: "Vincular disciplina",
  },
  professores: {
    campo: "Professor",
    nomeCampo: "professor_id",
    grupoCampo: "atividade_id",
    vazio: "Nenhum professor vinculado.",
    adicionar: "Vincular professor",
  },
};

/** Turma extra ou atividade que recebe os vínculos. */
export type GrupoVinculo = {
  id: string;
  titulo: string;
  subtitulo: string;
};

type VinculosExtrasPanelProps = {
  kind: VinculoKind;
  grupos: GrupoVinculo[];
  vinculosPorGrupo: Record<string, VinculoTurmaExtra[]>;
  opcoes: VinculoTurmaExtra[];
  emptyTitle: string;
  emptyDescription: string;
  emptyActionHref: string;
  emptyActionLabel: string;
};

export function VinculosExtrasPanel({
  kind,
  grupos,
  vinculosPorGrupo,
  opcoes,
  emptyTitle,
  emptyDescription,
  emptyActionHref,
  emptyActionLabel,
}: VinculosExtrasPanelProps) {
  if (grupos.length === 0) {
    return (
      <ExtrasEmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionHref={emptyActionHref}
        actionLabel={emptyActionLabel}
      />
    );
  }

  return (
    <div className="space-y-4">
      {grupos.map((grupo) => (
        <GrupoVinculosCard
          key={grupo.id}
          kind={kind}
          grupo={grupo}
          vinculos={vinculosPorGrupo[grupo.id] ?? []}
          opcoes={opcoes}
        />
      ))}
    </div>
  );
}

function GrupoVinculosCard({
  kind,
  grupo,
  vinculos,
  opcoes,
}: {
  kind: VinculoKind;
  grupo: GrupoVinculo;
  vinculos: VinculoTurmaExtra[];
  opcoes: VinculoTurmaExtra[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textos = TEXTOS[kind];

  const vinculados = new Set(vinculos.map((item) => item.id));
  const disponiveis = opcoes.filter((item) => !vinculados.has(item.id));

  async function handleAdd(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set(textos.grupoCampo, grupo.id);

    const result =
      kind === "alunos"
        ? await vincularAlunoTurmaExtra(formData)
        : kind === "disciplinas"
          ? await vincularDisciplinaTurmaExtra(formData)
          : await vincularProfessorAtividade(formData);

    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setLoading(false);
  }

  async function handleRemove(id: string) {
    setLoading(true);
    setError(null);

    const result =
      kind === "alunos"
        ? await desvincularAlunoTurmaExtra(grupo.id, id)
        : kind === "disciplinas"
          ? await desvincularDisciplinaTurmaExtra(grupo.id, id)
          : await desvincularProfessorAtividade(grupo.id, id);

    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Card>
      <CardTitle>{grupo.titulo}</CardTitle>
      <CardDescription>
        {grupo.subtitulo} • {vinculos.length} vínculo(s)
      </CardDescription>

      <form action={handleAdd} className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <label
            htmlFor={`${textos.nomeCampo}-${grupo.id}`}
            className="text-xs font-medium text-slate-700"
          >
            {textos.campo}
          </label>
          <select
            id={`${textos.nomeCampo}-${grupo.id}`}
            name={textos.nomeCampo}
            required
            defaultValue=""
            className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="" disabled>
              {disponiveis.length ? "Selecione..." : "Nada disponível"}
            </option>
            {disponiveis.map((opcao) => (
              <option key={opcao.id} value={opcao.id}>
                {opcao.nome}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          disabled={loading || disponiveis.length === 0}
          className="h-10 px-4 text-sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <>
              <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
              {textos.adicionar}
            </>
          )}
        </Button>
      </form>

      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      {vinculos.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">{textos.vazio}</p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {vinculos.map((vinculo) => (
            <li
              key={vinculo.id}
              className="flex items-center gap-2 rounded-full bg-[#E3F2FD] px-3 py-1.5 text-xs font-medium text-[#1E7BB8]"
            >
              {vinculo.nome}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleRemove(vinculo.id)}
                aria-label={`Remover ${vinculo.nome}`}
                className="rounded-full p-0.5 text-[#1E7BB8] transition-colors hover:bg-white hover:text-red-700"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
