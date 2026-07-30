"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { definirProfessorTurmaExtra } from "@/actions/gestor-extras";
import { ExtrasEmptyState } from "@/components/gestor/extras/extras-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { TurmaExtra, VinculoTurmaExtra } from "@/lib/extras-config";

type ProfessorExtraPanelProps = {
  turmas: TurmaExtra[];
  professores: VinculoTurmaExtra[];
  cadastroTurmasHref: string;
};

export function ProfessorExtraPanel({
  turmas,
  professores,
  cadastroTurmasHref,
}: ProfessorExtraPanelProps) {
  if (turmas.length === 0) {
    return (
      <ExtrasEmptyState
        title="Nenhuma turma cadastrada"
        description="Cadastre uma turma antes de definir o professor responsável."
        actionHref={cadastroTurmasHref}
        actionLabel="Cadastrar turma"
      />
    );
  }

  return (
    <div className="space-y-4">
      {turmas.map((turma) => (
        <TurmaProfessorCard
          key={turma.id}
          turma={turma}
          professores={professores}
        />
      ))}
    </div>
  );
}

function TurmaProfessorCard({
  turma,
  professores,
}: {
  turma: TurmaExtra;
  professores: VinculoTurmaExtra[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setMessage(null);
    formData.set("turma_extra_id", turma.id);

    const result = await definirProfessorTurmaExtra(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Vínculo atualizado.");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Card>
      <CardTitle>{turma.nome}</CardTitle>
      <CardDescription>
        {turma.turno}
        {turma.atividadeNome ? ` • ${turma.atividadeNome}` : null} •{" "}
        {turma.professorNome
          ? `Responsável atual: ${turma.professorNome}`
          : "Sem professor responsável"}
      </CardDescription>

      <form
        action={handleSubmit}
        className="mt-4 flex flex-wrap items-end gap-3"
      >
        <div className="min-w-[240px] flex-1">
          <label
            htmlFor={`professor-${turma.id}`}
            className="text-xs font-medium text-slate-700"
          >
            Professor responsável
          </label>
          <select
            id={`professor-${turma.id}`}
            name="professor_id"
            defaultValue={turma.professorId ?? ""}
            className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">Sem professor</option>
            {professores.map((professor) => (
              <option key={professor.id} value={professor.id}>
                {professor.nome}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" disabled={loading} className="h-10 px-4 text-sm">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            "Salvar"
          )}
        </Button>
      </form>

      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
          {message}
        </p>
      ) : null}
    </Card>
  );
}
