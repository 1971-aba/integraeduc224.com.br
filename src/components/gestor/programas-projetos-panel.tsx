"use client";

import { Loader2, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  criarProgramaProjeto,
  excluirProgramaProjeto,
} from "@/actions/gestor-programas-projetos";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  TIPOS_PROGRAMA_PROJETO,
  type ProgramaProjeto,
} from "@/lib/programas-projetos-config";
import type {
  EtapaProgramaProjeto,
  TipoProgramaProjeto,
} from "@/types/database";

type ProgramasProjetosPanelProps = {
  tipo: TipoProgramaProjeto;
  etapa: EtapaProgramaProjeto;
  itens: ProgramaProjeto[];
  vincularHref: string;
};

function formatPeriodo(inicio: string | null, fim: string | null) {
  if (!inicio && !fim) return null;
  const formatar = (data: string) =>
    new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
  if (inicio && fim) return `${formatar(inicio)} a ${formatar(fim)}`;
  return inicio ? `A partir de ${formatar(inicio)}` : `Até ${formatar(fim!)}`;
}

export function ProgramasProjetosPanel({
  tipo,
  etapa,
  itens,
  vincularHref,
}: ProgramasProjetosPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [removendo, setRemovendo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const textos = TIPOS_PROGRAMA_PROJETO[tipo];

  async function handleCriar(formData: FormData) {
    setLoading(true);
    setErro(null);

    const result = await criarProgramaProjeto(tipo, etapa, formData);
    setLoading(false);

    if (result?.error) {
      setErro(result.error);
      return;
    }

    router.refresh();
  }

  async function handleExcluir(id: string) {
    setRemovendo(id);
    setErro(null);

    const result = await excluirProgramaProjeto(tipo, id);
    setRemovendo(null);

    if (result?.error) {
      setErro(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>Cadastrar {textos.singular.toLowerCase()}</CardTitle>
        <CardDescription>
          O vínculo dos alunos é feito depois, em Vincular Alunos
        </CardDescription>

        <form action={handleCriar} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="nome" className="text-sm font-medium text-slate-700">
                Nome
              </label>
              <Input
                id="nome"
                name="nome"
                required
                placeholder={`Nome do ${textos.singular.toLowerCase()}`}
                className="mt-2"
              />
            </div>

            <div>
              <label
                htmlFor="responsavel"
                className="text-sm font-medium text-slate-700"
              >
                Responsável
              </label>
              <Input
                id="responsavel"
                name="responsavel"
                placeholder="Professor ou coordenador"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="data_inicio"
                  className="text-sm font-medium text-slate-700"
                >
                  Início
                </label>
                <Input
                  id="data_inicio"
                  name="data_inicio"
                  type="date"
                  className="mt-2"
                />
              </div>
              <div>
                <label
                  htmlFor="data_fim"
                  className="text-sm font-medium text-slate-700"
                >
                  Término
                </label>
                <Input
                  id="data_fim"
                  name="data_fim"
                  type="date"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="descricao"
                className="text-sm font-medium text-slate-700"
              >
                Descrição
              </label>
              <textarea
                id="descricao"
                name="descricao"
                rows={3}
                placeholder="Objetivo, público atendido e periodicidade"
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              />
            </div>
          </div>

          {erro ? (
            <p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {erro}
            </p>
          ) : null}

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
              `Cadastrar ${textos.singular.toLowerCase()}`
            )}
          </Button>
        </form>
      </Card>

      <Card>
        <CardTitle>
          {textos.plural} cadastrados ({itens.length})
        </CardTitle>

        {itens.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Nenhum registro nesta etapa.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {itens.map((item) => {
              const periodo = formatPeriodo(item.dataInicio, item.dataFim);

              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{item.nome}</p>
                    {item.descricao ? (
                      <p className="mt-1 text-sm text-slate-600">
                        {item.descricao}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-slate-500">
                      {item.responsavel ?? "Sem responsável definido"}
                      {periodo ? ` · ${periodo}` : ""}
                    </p>
                    <Link
                      href={vincularHref}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline"
                    >
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      {item.totalAlunos} aluno(s) vinculado(s)
                    </Link>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleExcluir(item.id)}
                    disabled={removendo === item.id}
                    className="shrink-0"
                  >
                    {removendo === item.id ? (
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                        Excluir
                      </>
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
