"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { criarHorarioExtra, excluirHorarioExtra } from "@/actions/gestor-extras";
import { ExtrasEmptyState } from "@/components/gestor/extras/extras-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { DIAS_SEMANA_EXTRAS } from "@/lib/extras-config";
import type { HorarioExtra, TurmaExtra } from "@/lib/extras-config";

type HorarioExtraPanelProps = {
  turmas: TurmaExtra[];
  horarios: HorarioExtra[];
  cadastroTurmasHref: string;
};

export function HorarioExtraPanel({
  turmas,
  horarios,
  cadastroTurmasHref,
}: HorarioExtraPanelProps) {
  if (turmas.length === 0) {
    return (
      <ExtrasEmptyState
        title="Nenhuma turma cadastrada"
        description="Cadastre uma turma antes de montar o horário dos atendimentos."
        actionHref={cadastroTurmasHref}
        actionLabel="Cadastrar turma"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>Grade semanal</CardTitle>
        <CardDescription>
          {horarios.length} atendimento(s) programado(s)
        </CardDescription>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                  Turma
                </th>
                {DIAS_SEMANA_EXTRAS.map((dia) => (
                  <th
                    key={dia.valor}
                    className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700"
                  >
                    {dia.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {turmas.map((turma) => (
                <tr key={turma.id}>
                  <td className="border-b border-slate-100 px-3 py-2 font-medium text-slate-800">
                    {turma.nome}
                    <span className="block text-xs font-normal text-slate-500">
                      {turma.professorNome ?? "Sem professor"}
                    </span>
                  </td>
                  {DIAS_SEMANA_EXTRAS.map((dia) => {
                    const doDia = horarios.filter(
                      (horario) =>
                        horario.turmaExtraId === turma.id &&
                        horario.diaSemana === dia.valor,
                    );

                    return (
                      <td
                        key={dia.valor}
                        className="border-b border-slate-100 px-3 py-2 align-top text-slate-700"
                      >
                        {doDia.length === 0 ? (
                          <span className="text-slate-300">—</span>
                        ) : (
                          <ul className="space-y-1">
                            {doDia.map((horario) => (
                              <li key={horario.id} className="text-xs">
                                {horario.horaInicio} às {horario.horaFim}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {turmas.map((turma) => (
        <TurmaHorarioCard
          key={turma.id}
          turma={turma}
          horarios={horarios.filter(
            (horario) => horario.turmaExtraId === turma.id,
          )}
        />
      ))}
    </div>
  );
}

function TurmaHorarioCard({
  turma,
  horarios,
}: {
  turma: TurmaExtra;
  horarios: HorarioExtra[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("turma_extra_id", turma.id);

    const result = await criarHorarioExtra(formData);

    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setLoading(false);
  }

  async function handleRemove(horarioId: string) {
    setLoading(true);
    setError(null);

    const result = await excluirHorarioExtra(horarioId);

    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Card>
      <CardTitle>{turma.nome}</CardTitle>
      <CardDescription>
        {turma.turno}
        {turma.local ? ` • ${turma.local}` : null} • {horarios.length}{" "}
        atendimento(s)
      </CardDescription>

      <form action={handleAdd} className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[140px]">
          <label
            htmlFor={`dia-${turma.id}`}
            className="text-xs font-medium text-slate-700"
          >
            Dia
          </label>
          <select
            id={`dia-${turma.id}`}
            name="dia_semana"
            required
            defaultValue="1"
            className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            {DIAS_SEMANA_EXTRAS.map((dia) => (
              <option key={dia.valor} value={dia.valor}>
                {dia.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[120px]">
          <label
            htmlFor={`inicio-${turma.id}`}
            className="text-xs font-medium text-slate-700"
          >
            Início
          </label>
          <input
            id={`inicio-${turma.id}`}
            name="hora_inicio"
            type="time"
            required
            className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
          />
        </div>

        <div className="min-w-[120px]">
          <label
            htmlFor={`fim-${turma.id}`}
            className="text-xs font-medium text-slate-700"
          >
            Término
          </label>
          <input
            id={`fim-${turma.id}`}
            name="hora_fim"
            type="time"
            required
            className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
          />
        </div>

        <Button type="submit" disabled={loading} className="h-10 px-4 text-sm">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <>
              <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
              Adicionar
            </>
          )}
        </Button>
      </form>

      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      {horarios.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {horarios.map((horario) => (
            <li
              key={horario.id}
              className="flex items-center gap-2 rounded-full bg-[#E3F2FD] px-3 py-1.5 text-xs font-medium text-[#1E7BB8]"
            >
              {DIAS_SEMANA_EXTRAS.find(
                (dia) => dia.valor === horario.diaSemana,
              )?.label ?? "Dia"}{" "}
              {horario.horaInicio}–{horario.horaFim}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleRemove(horario.id)}
                aria-label="Remover horário"
                className="rounded-full p-0.5 text-[#1E7BB8] transition-colors hover:bg-white hover:text-red-700"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
