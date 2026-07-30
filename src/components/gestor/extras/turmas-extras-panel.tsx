"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { criarTurmaExtra, excluirTurmaExtra } from "@/actions/gestor-extras";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatTurnoLabel } from "@/lib/dashboard-utils";
import type { AtividadeExtra, TurmaExtra } from "@/lib/extras-config";
import type { TipoAtividadeExtra } from "@/types/database";

const TURNOS = ["manha", "tarde", "noite", "integral"] as const;

type TurmasExtrasPanelProps = {
  tipo: TipoAtividadeExtra;
  turmas: TurmaExtra[];
  atividades: AtividadeExtra[];
};

export function TurmasExtrasPanel({
  tipo,
  turmas,
  atividades,
}: TurmasExtrasPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setMessage(null);
    formData.set("tipo", tipo);

    const result = await criarTurmaExtra(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Turma cadastrada com sucesso.");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardTitle>Nova turma</CardTitle>
        <CardDescription>
          {tipo === "aee"
            ? "Grupo de atendimento especializado"
            : "Grupo de estudantes da atividade complementar"}
        </CardDescription>

        <form action={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="nome"
              className="text-sm font-medium text-slate-700"
            >
              Nome da turma
            </label>
            <input
              id="nome"
              name="nome"
              required
              placeholder={tipo === "aee" ? "Ex.: AEE Manhã A" : "Ex.: Reforço A"}
              className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="turno"
              className="text-sm font-medium text-slate-700"
            >
              Turno
            </label>
            <select
              id="turno"
              name="turno"
              required
              defaultValue="manha"
              className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              {TURNOS.map((turno) => (
                <option key={turno} value={turno}>
                  {formatTurnoLabel(turno)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="atividade_id"
              className="text-sm font-medium text-slate-700"
            >
              Atividade
            </label>
            <select
              id="atividade_id"
              name="atividade_id"
              defaultValue=""
              className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">Sem atividade definida</option>
              {atividades.map((atividade) => (
                <option key={atividade.id} value={atividade.id}>
                  {atividade.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="local"
              className="text-sm font-medium text-slate-700"
            >
              Local
            </label>
            <input
              id="local"
              name="local"
              placeholder="Ex.: Sala de recursos"
              className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            />
          </div>

          {error ? (
            <p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          {message ? (
            <p
              className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700"
              role="status"
            >
              {message}
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
              "Cadastrar turma"
            )}
          </Button>
        </form>
      </Card>

      <Card>
        <CardTitle>Turmas cadastradas</CardTitle>
        <CardDescription>{turmas.length} turma(s) registrada(s)</CardDescription>

        {turmas.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            Nenhuma turma cadastrada ainda.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {turmas.map((turma) => (
              <TurmaItem key={turma.id} turma={turma} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function TurmaItem({ turma }: { turma: TurmaExtra }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm(`Excluir a turma "${turma.nome}"?`)) return;

    setLoading(true);
    setError(null);

    const result = await excluirTurmaExtra(turma.id);

    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <li className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{turma.nome}</p>
          <p className="mt-1 text-sm text-slate-600">
            {turma.turno}
            {turma.atividadeNome ? ` • ${turma.atividadeNome}` : null}
            {turma.local ? ` • ${turma.local}` : null}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {turma.professorNome ?? "Sem professor"} • {turma.alunos}{" "}
            estudante(s) • {turma.disciplinas} disciplina(s) • {turma.aulas}{" "}
            horário(s)
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          disabled={loading}
          className="h-8 px-2.5 text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
          onClick={handleDelete}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <>
              <Trash2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Excluir
            </>
          )}
        </Button>
      </div>

      {error ? (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </li>
  );
}
