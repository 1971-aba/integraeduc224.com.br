"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { salvarNotas } from "@/actions/diario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calcularMediaAnual, calcMediaBimestre } from "@/lib/diario-utils";

type Bimestre = {
  id: string;
  numero: number;
};

type AlunoNota = {
  matriculaId: string;
  nome: string;
  notas: Record<
    string,
    { nota: number | null; recuperacao: number | null; media: number | null }
  >;
};

type NotasFormProps = {
  atribuicaoId: string;
  bimestres: Bimestre[];
  alunos: AlunoNota[];
  bimestreInicialId: string;
};

function calcMediaBimestreLocal(nota: number | null, recuperacao: number | null) {
  return calcMediaBimestre(nota, recuperacao);
}

export function NotasForm({
  atribuicaoId,
  bimestres,
  alunos: alunosIniciais,
  bimestreInicialId,
}: NotasFormProps) {
  const [bimestreId, setBimestreId] = useState(bimestreInicialId);
  const [alunos, setAlunos] = useState(alunosIniciais);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bimestreAtual = bimestres.find((b) => b.id === bimestreId);

  function atualizarNota(
    matriculaId: string,
    campo: "nota" | "recuperacao",
    valor: string,
  ) {
    const parsed = valor === "" ? null : Number(valor);
    setAlunos((prev) =>
      prev.map((aluno) => {
        if (aluno.matriculaId !== matriculaId) return aluno;
        const atual = aluno.notas[bimestreId] ?? {
          nota: null,
          recuperacao: null,
          media: null,
        };
        const nota = campo === "nota" ? parsed : atual.nota;
        const recuperacao =
          campo === "recuperacao" ? parsed : atual.recuperacao;
        return {
          ...aluno,
          notas: {
            ...aluno.notas,
            [bimestreId]: {
              nota,
              recuperacao,
              media: calcMediaBimestreLocal(nota, recuperacao),
            },
          },
        };
      }),
    );
  }

  const mediasTurma = useMemo(() => {
    const valores = alunos
      .map((aluno) => {
        const medias = bimestres.map(
          (b) => aluno.notas[b.id]?.media ?? null,
        );
        return calcularMediaAnual(medias);
      })
      .filter((m): m is number => m !== null);

    if (valores.length === 0) return null;
    return (
      Math.round(
        (valores.reduce((a, b) => a + b, 0) / valores.length) * 100,
      ) / 100
    );
  }, [alunos, bimestres]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const payload = alunos.map((aluno) => {
      const item = aluno.notas[bimestreId] ?? {
        nota: null,
        recuperacao: null,
        media: null,
      };
      return {
        matriculaId: aluno.matriculaId,
        nota: item.nota,
        recuperacao: item.recuperacao,
      };
    });

    const result = await salvarNotas(atribuicaoId, bimestreId, payload);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Notas salvas com sucesso.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-24 sm:pb-0">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <label htmlFor="bimestre" className="text-sm font-medium text-slate-700">
          Bimestre
        </label>
        <select
          id="bimestre"
          value={bimestreId}
          onChange={(event) => setBimestreId(event.target.value)}
          className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
        >
          {bimestres.map((bimestre) => (
            <option key={bimestre.id} value={bimestre.id}>
              {bimestre.numero}º bimestre
            </option>
          ))}
        </select>
        {mediasTurma !== null ? (
          <p className="mt-2 text-sm text-slate-500">
            Média geral da turma:{" "}
            <span className="font-semibold text-slate-900">{mediasTurma}</span>
          </p>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white md:block">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Aluno</th>
              <th className="px-4 py-3 text-left font-medium">Nota</th>
              <th className="px-4 py-3 text-left font-medium">Recuperação</th>
              <th className="px-4 py-3 text-left font-medium">Média</th>
              <th className="px-4 py-3 text-left font-medium">Média anual</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno) => {
              const item = aluno.notas[bimestreId] ?? {
                nota: null,
                recuperacao: null,
                media: null,
              };
              const mediaAnual = calcularMediaAnual(
                bimestres.map((b) => aluno.notas[b.id]?.media ?? null),
              );
              return (
                <tr key={aluno.matriculaId} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{aluno.nome}</td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={item.nota ?? ""}
                      onChange={(e) =>
                        atualizarNota(aluno.matriculaId, "nota", e.target.value)
                      }
                      className="w-24"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={item.recuperacao ?? ""}
                      onChange={(e) =>
                        atualizarNota(
                          aluno.matriculaId,
                          "recuperacao",
                          e.target.value,
                        )
                      }
                      className="w-24"
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {item.media ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {mediaAnual ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {alunos.map((aluno) => {
          const item = aluno.notas[bimestreId] ?? {
            nota: null,
            recuperacao: null,
            media: null,
          };
          const mediaAnual = calcularMediaAnual(
            bimestres.map((b) => aluno.notas[b.id]?.media ?? null),
          );
          return (
            <li
              key={aluno.matriculaId}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <p className="font-medium text-slate-900">{aluno.nome}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Nota</label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    value={item.nota ?? ""}
                    onChange={(e) =>
                      atualizarNota(aluno.matriculaId, "nota", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Recuperação</label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    value={item.recuperacao ?? ""}
                    onChange={(e) =>
                      atualizarNota(
                        aluno.matriculaId,
                        "recuperacao",
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-slate-500">
                  Média {bimestreAtual?.numero}º bim:
                </span>
                <span className="font-semibold">{item.media ?? "—"}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-slate-500">Média anual:</span>
                <span className="font-medium">{mediaAnual ?? "—"}</span>
              </div>
            </li>
          );
        })}
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
          `Salvar notas do ${bimestreAtual?.numero}º bimestre`
        )}
      </Button>
    </form>
  );
}
