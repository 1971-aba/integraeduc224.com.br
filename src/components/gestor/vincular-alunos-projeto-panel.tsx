"use client";

import { Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  desvincularAlunoProgramaProjeto,
  vincularAlunoProgramaProjeto,
} from "@/actions/gestor-programas-projetos";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  ETAPAS_PROGRAMA_PROJETO,
  TIPOS_PROGRAMA_PROJETO,
  type AlunoOpcao,
  type AlunoVinculado,
  type ProgramaProjeto,
} from "@/lib/programas-projetos-config";
import type { TipoProgramaProjeto } from "@/types/database";

type VincularAlunosProjetoPanelProps = {
  tipo: TipoProgramaProjeto;
  itens: ProgramaProjeto[];
  alunos: AlunoOpcao[];
  vinculosPorItem: Record<string, AlunoVinculado[]>;
  cadastroHref: string;
};

export function VincularAlunosProjetoPanel({
  tipo,
  itens,
  alunos,
  vinculosPorItem,
  cadastroHref,
}: VincularAlunosProjetoPanelProps) {
  const router = useRouter();
  const [selecionado, setSelecionado] = useState<Record<string, string>>({});
  const [processando, setProcessando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const textos = TIPOS_PROGRAMA_PROJETO[tipo];

  async function handleVincular(itemId: string) {
    const alunoId = selecionado[itemId];

    if (!alunoId) {
      setErro("Selecione um aluno para vincular.");
      return;
    }

    setProcessando(itemId);
    setErro(null);

    const result = await vincularAlunoProgramaProjeto(tipo, itemId, alunoId);
    setProcessando(null);

    if (result?.error) {
      setErro(result.error);
      return;
    }

    setSelecionado((atual) => ({ ...atual, [itemId]: "" }));
    router.refresh();
  }

  async function handleDesvincular(vinculoId: string) {
    setProcessando(vinculoId);
    setErro(null);

    const result = await desvincularAlunoProgramaProjeto(tipo, vinculoId);
    setProcessando(null);

    if (result?.error) {
      setErro(result.error);
      return;
    }

    router.refresh();
  }

  if (itens.length === 0) {
    return (
      <Card>
        <CardTitle>Nenhum {textos.singular.toLowerCase()} cadastrado</CardTitle>
        <CardDescription>
          Cadastre antes de vincular alunos.
        </CardDescription>
        <Link
          href={cadastroHref}
          className="mt-4 inline-flex h-10 items-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800"
        >
          Cadastrar {textos.singular.toLowerCase()}
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {erro ? (
        <p
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {erro}
        </p>
      ) : null}

      {itens.map((item) => {
        const vinculados = vinculosPorItem[item.id] ?? [];
        const jaVinculados = new Set(vinculados.map((v) => v.alunoId));
        const disponiveis = alunos.filter((aluno) => !jaVinculados.has(aluno.id));

        return (
          <Card key={item.id}>
            <CardTitle>{item.nome}</CardTitle>
            <CardDescription>
              {ETAPAS_PROGRAMA_PROJETO[item.etapa].label} ·{" "}
              {vinculados.length} aluno(s)
            </CardDescription>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <select
                aria-label={`Aluno para vincular a ${item.nome}`}
                value={selecionado[item.id] ?? ""}
                onChange={(event) =>
                  setSelecionado((atual) => ({
                    ...atual,
                    [item.id]: event.target.value,
                  }))
                }
                className="h-11 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                <option value="">Selecione o aluno...</option>
                {disponiveis.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nome} — {aluno.turma}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                onClick={() => handleVincular(item.id)}
                disabled={processando === item.id || disponiveis.length === 0}
                className="shrink-0"
              >
                {processando === item.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Vincular
                  </>
                )}
              </Button>
            </div>

            {vinculados.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center text-sm text-slate-500">
                Nenhum aluno vinculado.
              </p>
            ) : (
              <ul className="mt-4 flex flex-wrap gap-2">
                {vinculados.map((vinculo) => (
                  <li
                    key={vinculo.vinculoId}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-3 pr-1 text-sm"
                  >
                    <span className="text-slate-800">
                      {vinculo.nome}
                      <span className="text-slate-500"> · {vinculo.turma}</span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Remover ${vinculo.nome}`}
                      onClick={() => handleDesvincular(vinculo.vinculoId)}
                      disabled={processando === vinculo.vinculoId}
                      className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                    >
                      {processando === vinculo.vinculoId ? (
                        <Loader2
                          className="h-3.5 w-3.5 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      })}
    </div>
  );
}
