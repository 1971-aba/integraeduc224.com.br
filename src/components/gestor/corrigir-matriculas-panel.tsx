"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  atualizarDataMatricula,
  cancelarMatriculaCorrecao,
  matricularAlunoCorrecao,
  transferirMatriculaCorrecao,
} from "@/actions/gestor-matriculas-correcao";
import { Button } from "@/components/ui/button";
import type {
  AlunoSemMatricula2026,
  MatriculaCorrecaoItem,
} from "@/lib/gestor-modulos-types";
import { formatCpf } from "@/lib/utils";

type TurmaOption = { id: string; label: string };

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

export function MatriculaCorrecaoRow({
  matricula,
  turmas,
}: {
  matricula: MatriculaCorrecaoItem;
  turmas: TurmaOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [modo, setModo] = useState<"none" | "transferir" | "data">("none");
  const [turmaDestino, setTurmaDestino] = useState("");
  const [novaData, setNovaData] = useState(matricula.dataMatricula);

  const turmasDestino = turmas.filter((t) => t.id !== matricula.turmaId);

  function runAction(action: () => Promise<{ error?: string; success?: boolean }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) setError(result.error);
      else {
        setModo("none");
        router.refresh();
      }
    });
  }

  return (
    <tr className="border-b border-slate-100 align-top">
      <td className="px-3 py-3">
        <div className="flex items-start gap-2">
          {matricula.duplicada ? (
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
              aria-hidden="true"
            />
          ) : null}
          <div>
            <p className="font-medium text-slate-900">{matricula.alunoNome}</p>
            {matricula.duplicada ? (
              <p className="text-xs text-amber-700">Matrícula duplicada</p>
            ) : null}
            <Link
              href={`/gestor/alunos/${matricula.alunoId}`}
              className="text-xs text-blue-700 hover:underline"
            >
              Abrir ficha
            </Link>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-slate-600">
        {matricula.turmaNome} ({matricula.turmaSerie})
      </td>
      <td className="px-3 py-3 text-slate-600">
        {formatDate(matricula.dataMatricula)}
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setModo(modo === "transferir" ? "none" : "transferir")
            }
            className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Transferir
          </button>
          <button
            type="button"
            onClick={() => setModo(modo === "data" ? "none" : "data")}
            className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Corrigir data
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (
                !confirm(
                  `Cancelar a matrícula de ${matricula.alunoNome}?`,
                )
              ) {
                return;
              }
              runAction(() => cancelarMatriculaCorrecao(matricula.matriculaId));
            }}
            className="rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>

        {modo === "transferir" ? (
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <select
              value={turmaDestino}
              onChange={(e) => setTurmaDestino(e.target.value)}
              className="h-9 min-w-[180px] rounded-md border border-slate-300 px-2 text-xs"
            >
              <option value="">Turma de destino...</option>
              {turmasDestino.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={pending || !turmaDestino}
              onClick={() =>
                runAction(() =>
                  transferirMatriculaCorrecao(
                    matricula.alunoId,
                    matricula.matriculaId,
                    turmaDestino,
                  ),
                )
              }
              className="inline-flex h-9 items-center rounded-md bg-[#1E7BB8] px-3 text-xs font-medium text-white disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Confirmar"
              )}
            </button>
          </div>
        ) : null}

        {modo === "data" ? (
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <input
              type="date"
              value={novaData}
              onChange={(e) => setNovaData(e.target.value)}
              className="h-9 rounded-md border border-slate-300 px-2 text-xs"
            />
            <button
              type="button"
              disabled={pending || !novaData}
              onClick={() =>
                runAction(() =>
                  atualizarDataMatricula(matricula.matriculaId, novaData),
                )
              }
              className="inline-flex h-9 items-center rounded-md bg-[#1E7BB8] px-3 text-xs font-medium text-white disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Salvar data"
              )}
            </button>
          </div>
        ) : null}

        {error ? (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        ) : null}
      </td>
    </tr>
  );
}

export function AlunoSemMatriculaRow({
  aluno,
  turmas,
}: {
  aluno: AlunoSemMatricula2026;
  turmas: TurmaOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [turmaId, setTurmaId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleMatricular() {
    if (!turmaId) return;
    setError(null);
    startTransition(async () => {
      const result = await matricularAlunoCorrecao(aluno.alunoId, turmaId);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm">
      <div>
        <p className="font-medium text-slate-900">{aluno.alunoNome}</p>
        <p className="text-slate-600">
          {aluno.cpf ? formatCpf(aluno.cpf) : "CPF não informado"}
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <select
          value={turmaId}
          onChange={(e) => setTurmaId(e.target.value)}
          className="h-9 min-w-[180px] rounded-md border border-slate-300 px-2 text-xs"
        >
          <option value="">Selecione a turma...</option>
          {turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.label}
            </option>
          ))}
        </select>
        <Button
          type="button"
          disabled={pending || !turmaId}
          onClick={handleMatricular}
          className="h-9 px-3 text-xs"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Matricular"
          )}
        </Button>
      </div>
      {error ? <p className="w-full text-xs text-red-600">{error}</p> : null}
    </li>
  );
}
