"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { matricularAluno } from "@/actions/secretaria";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { AlunoParaVincular, TurmaDestino } from "@/lib/gestor-alunos-vinculo";
import { formatCpf } from "@/lib/utils";

type VincularAlunoPanelProps = {
  alunos: AlunoParaVincular[];
  turmas: TurmaDestino[];
  acaoLabel: string;
  vazioTitulo: string;
  vazioDescricao: string;
};

function formatData(data: string | null) {
  if (!data) return "—";
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
}

export function VincularAlunoPanel({
  alunos,
  turmas,
  acaoLabel,
  vazioTitulo,
  vazioDescricao,
}: VincularAlunoPanelProps) {
  const router = useRouter();
  const [turmaPorAluno, setTurmaPorAluno] = useState<Record<string, string>>({});
  const [processando, setProcessando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function handleVincular(aluno: AlunoParaVincular) {
    const turmaId = turmaPorAluno[aluno.id];

    if (!turmaId) {
      setErro(`Selecione a turma de destino de ${aluno.nome}.`);
      setMensagem(null);
      return;
    }

    setProcessando(aluno.id);
    setErro(null);
    setMensagem(null);

    const result = await matricularAluno(aluno.id, turmaId);
    setProcessando(null);

    if (result?.error) {
      setErro(result.error);
      return;
    }

    setMensagem(`${aluno.nome} foi matriculado(a) com sucesso.`);
    router.refresh();
  }

  if (turmas.length === 0) {
    return (
      <Card>
        <CardTitle>Nenhuma turma disponível</CardTitle>
        <CardDescription>
          Cadastre as turmas da escola antes de vincular alunos.
        </CardDescription>
      </Card>
    );
  }

  if (alunos.length === 0) {
    return (
      <Card>
        <CardTitle>{vazioTitulo}</CardTitle>
        <CardDescription>{vazioDescricao}</CardDescription>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>{alunos.length} aluno(s) encontrado(s)</CardTitle>
      <CardDescription>
        Escolha a turma de destino e confirme para criar a matrícula nesta escola
      </CardDescription>

      {erro ? (
        <p
          className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {erro}
        </p>
      ) : null}
      {mensagem ? (
        <p
          className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700"
          role="status"
        >
          {mensagem}
        </p>
      ) : null}

      <ul className="mt-4 divide-y divide-slate-100">
        {alunos.map((aluno) => (
          <li
            key={aluno.id}
            className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium text-slate-900">{aluno.nome}</p>
              <p className="mt-0.5 text-sm text-slate-600">
                {aluno.cpf ? formatCpf(aluno.cpf) : "Sem CPF"} · Nascimento{" "}
                {formatData(aluno.dataNascimento)}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {aluno.nomeMae ?? "Responsável não informado"}
                {aluno.ultimaMovimentacao
                  ? ` · Última movimentação em ${formatData(
                      aluno.ultimaMovimentacao,
                    )}`
                  : " · Sem matrícula anterior"}
                {aluno.saiuDestaEscola ? " · Nesta escola" : ""}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <select
                aria-label={`Turma de destino de ${aluno.nome}`}
                value={turmaPorAluno[aluno.id] ?? ""}
                onChange={(event) =>
                  setTurmaPorAluno((atual) => ({
                    ...atual,
                    [aluno.id]: event.target.value,
                  }))
                }
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                <option value="">Turma de destino...</option>
                {turmas.map((turma) => (
                  <option key={turma.id} value={turma.id}>
                    {turma.label}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                onClick={() => handleVincular(aluno)}
                disabled={processando === aluno.id}
              >
                {processando === aluno.id ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Vinculando...
                  </>
                ) : (
                  acaoLabel
                )}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
