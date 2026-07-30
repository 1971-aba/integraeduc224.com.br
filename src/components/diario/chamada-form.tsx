"use client";

import { Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { salvarChamada } from "@/actions/diario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateInput, type PresencaStatus } from "@/lib/diario-utils";
import { cn } from "@/lib/utils";

type AlunoChamada = {
  matriculaId: string;
  nome: string;
  status: PresencaStatus;
};

type ChamadaFormProps = {
  atribuicaoId: string;
  dataInicial: string;
  alunos: AlunoChamada[];
  diaLetivo: boolean;
};

const statusOptions: Array<{
  value: PresencaStatus;
  label: string;
  short: string;
  className: string;
}> = [
  {
    value: "presente",
    label: "Presente",
    short: "P",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  {
    value: "falta",
    label: "Falta",
    short: "F",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  {
    value: "justificada",
    label: "Justificada",
    short: "J",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
];

export function ChamadaForm({
  atribuicaoId,
  dataInicial,
  alunos: alunosIniciais,
  diaLetivo: diaLetivoInicial,
}: ChamadaFormProps) {
  const router = useRouter();
  const [data, setData] = useState(dataInicial);
  const [alunos, setAlunos] = useState(alunosIniciais);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resumo = useMemo(() => {
    return {
      presentes: alunos.filter((a) => a.status === "presente").length,
      faltas: alunos.filter((a) => a.status === "falta").length,
      justificadas: alunos.filter((a) => a.status === "justificada").length,
    };
  }, [alunos]);

  function marcarTodos(status: PresencaStatus) {
    setAlunos((prev) => prev.map((aluno) => ({ ...aluno, status })));
  }

  function alterarStatus(matriculaId: string, status: PresencaStatus) {
    setAlunos((prev) =>
      prev.map((aluno) =>
        aluno.matriculaId === matriculaId ? { ...aluno, status } : aluno,
      ),
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const result = await salvarChamada(
      atribuicaoId,
      data,
      alunos.map((aluno) => ({
        matriculaId: aluno.matriculaId,
        status: aluno.status,
      })),
    );

    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Chamada salva com sucesso.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-24 sm:pb-0">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <label htmlFor="data-chamada" className="text-sm font-medium text-slate-700">
          Data da aula
        </label>
        <Input
          id="data-chamada"
          type="date"
          value={data}
          onChange={(event) => {
            const novaData = event.target.value;
            setData(novaData);
            setMessage(null);
            setError(null);
            router.push(`?data=${novaData}`);
          }}
          className="mt-2"
          required
        />
        <p className="mt-2 text-sm text-slate-500">
          {formatDateInput(data)}
          {!diaLetivoInicial && data === dataInicial ? (
            <span className="ml-2 text-amber-700">— dia não letivo</span>
          ) : null}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => marcarTodos("presente")}>
          <Check className="mr-1 h-4 w-4" aria-hidden="true" />
          Todos presentes
        </Button>
        <Button type="button" variant="secondary" onClick={() => marcarTodos("falta")}>
          <X className="mr-1 h-4 w-4" aria-hidden="true" />
          Todos faltantes
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl bg-green-50 px-3 py-2 text-green-800">
          <p className="font-semibold">{resumo.presentes}</p>
          <p>Presentes</p>
        </div>
        <div className="rounded-xl bg-red-50 px-3 py-2 text-red-800">
          <p className="font-semibold">{resumo.faltas}</p>
          <p>Faltas</p>
        </div>
        <div className="rounded-xl bg-amber-50 px-3 py-2 text-amber-800">
          <p className="font-semibold">{resumo.justificadas}</p>
          <p>Justificadas</p>
        </div>
      </div>

      <ul className="space-y-3">
        {alunos.map((aluno) => (
          <li
            key={aluno.matriculaId}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <p className="mb-3 font-medium text-slate-900">{aluno.nome}</p>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => alterarStatus(aluno.matriculaId, option.value)}
                  className={cn(
                    "h-11 rounded-xl border text-sm font-medium transition-colors",
                    aluno.status === option.value
                      ? option.className
                      : "border-slate-200 bg-slate-50 text-slate-600",
                  )}
                  aria-pressed={aluno.status === option.value}
                  aria-label={`${option.label} — ${aluno.nome}`}
                >
                  {option.short}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>

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

      <Button type="submit" className="fixed bottom-20 left-4 right-4 z-10 sm:static sm:w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Salvando...
          </>
        ) : (
          "Salvar chamada"
        )}
      </Button>
    </form>
  );
}
