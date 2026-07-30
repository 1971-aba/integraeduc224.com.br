"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { matricularAluno, transferirAluno } from "@/actions/secretaria";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type TurmaOption = { id: string; label: string };

type MatriculaActionsProps = {
  alunoId: string;
  matriculaAtiva: {
    id: string;
    turmaId: string;
    turmaNome: string;
    turmaSerie: string;
  } | null;
  turmas: TurmaOption[];
};

export function MatriculaActions({
  alunoId,
  matriculaAtiva,
  turmas,
}: MatriculaActionsProps) {
  const router = useRouter();

  return (
    <div className="grid gap-4">
      {!matriculaAtiva ? (
        <MatricularForm
          alunoId={alunoId}
          turmas={turmas}
          onDone={() => router.refresh()}
        />
      ) : (
        <>
          <Card>
            <CardTitle>Matrícula ativa</CardTitle>
            <CardDescription className="mt-2">
              {matriculaAtiva.turmaNome} — {matriculaAtiva.turmaSerie}
            </CardDescription>
          </Card>

          <TransferirForm
            alunoId={alunoId}
            matriculaId={matriculaAtiva.id}
            turmaAtualId={matriculaAtiva.turmaId}
            turmas={turmas}
            onDone={() => router.refresh()}
          />
        </>
      )}
    </div>
  );
}

function MatricularForm({
  alunoId,
  turmas,
  onDone,
}: {
  alunoId: string;
  turmas: TurmaOption[];
  onDone: () => void;
}) {
  const [turmaId, setTurmaId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!turmaId) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    const result = await matricularAluno(alunoId, turmaId);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Matrícula realizada com sucesso.");
      onDone();
    }

    setLoading(false);
  }

  return (
    <Card>
      <CardTitle>Matricular aluno</CardTitle>
      <CardDescription>Vincule o aluno a uma turma do ano letivo</CardDescription>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <select
          value={turmaId}
          onChange={(event) => setTurmaId(event.target.value)}
          required
          className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="" disabled>
            Selecione a turma...
          </option>
          {turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.label}
            </option>
          ))}
        </select>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
            {message}
          </p>
        ) : null}

        <Button type="submit" disabled={loading || !turmaId}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Matriculando...
            </>
          ) : (
            "Confirmar matrícula"
          )}
        </Button>
      </form>
    </Card>
  );
}

function TransferirForm({
  alunoId,
  matriculaId,
  turmaAtualId,
  turmas,
  onDone,
}: {
  alunoId: string;
  matriculaId: string;
  turmaAtualId: string;
  turmas: TurmaOption[];
  onDone: () => void;
}) {
  const [turmaDestinoId, setTurmaDestinoId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const turmasDestino = turmas.filter((turma) => turma.id !== turmaAtualId);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!turmaDestinoId) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    const result = await transferirAluno(alunoId, matriculaId, turmaDestinoId);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Transferência realizada com sucesso.");
      onDone();
    }

    setLoading(false);
  }

  return (
    <Card>
      <CardTitle>Transferir de turma</CardTitle>
      <CardDescription>
        Encerra a matrícula atual e abre nova matrícula na turma de destino
      </CardDescription>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <select
          value={turmaDestinoId}
          onChange={(event) => setTurmaDestinoId(event.target.value)}
          required
          className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="" disabled>
            Turma de destino...
          </option>
          {turmasDestino.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.label}
            </option>
          ))}
        </select>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
            {message}
          </p>
        ) : null}

        <Button type="submit" disabled={loading || !turmaDestinoId} variant="secondary">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Transferindo...
            </>
          ) : (
            "Transferir aluno"
          )}
        </Button>
      </form>
    </Card>
  );
}
