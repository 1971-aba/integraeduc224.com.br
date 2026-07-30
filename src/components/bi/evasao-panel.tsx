"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EVASAO_LIMITE_PERCENTUAL, type AlunoEvasao } from "@/lib/bi-types";

type EvasaoPanelProps = {
  alunos: AlunoEvasao[];
  porEscola: Array<{ escola: string; alunos: number }>;
  totalMatriculas?: number;
};

const ALERT_COLOR = "#dc2626";
const BAR_COLOR = "#f97316";

export function EvasaoPanel({ alunos, porEscola }: EvasaoPanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardTitle className="text-base">Alunos em alerta</CardTitle>
          <p className="mt-2 text-3xl font-bold text-red-600">{alunos.length}</p>
          <CardDescription>
            A partir de {EVASAO_LIMITE_PERCENTUAL}% de faltas (limite legal)
          </CardDescription>
        </Card>
        <Card>
          <CardTitle className="text-base">Escolas afetadas</CardTitle>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {porEscola.length}
          </p>
          <CardDescription>Unidades com alunos acima do limite</CardDescription>
        </Card>
        <Card>
          <CardTitle className="text-base">Maior índice</CardTitle>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {alunos[0]?.percentual_faltas ?? 0}%
          </p>
          <CardDescription>
            {alunos[0]?.aluno_nome ?? "Nenhum alerta ativo"}
          </CardDescription>
        </Card>
      </div>

      <Card>
        <CardTitle>Alerta de evasão por escola</CardTitle>
        <CardDescription>
          Quantidade de alunos com {EVASAO_LIMITE_PERCENTUAL}% ou mais de faltas
        </CardDescription>

        <div className="mt-4 h-72 w-full">
          {porEscola.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porEscola} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="escola"
                  tick={{ fontSize: 11 }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [`${value} aluno(s)`, "Em alerta"]}
                  contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0" }}
                />
                <Bar dataKey="alunos" radius={[6, 6, 0, 0]}>
                  {porEscola.map((_, index) => (
                    <Cell key={index} fill={index === 0 ? ALERT_COLOR : BAR_COLOR} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Nenhum aluno acima do limite de faltas no momento.
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardTitle>Lista de monitoramento</CardTitle>
        <CardDescription>Alunos que atingiram o limite legal de faltas</CardDescription>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Aluno</th>
                <th className="px-3 py-2 font-medium">Escola</th>
                <th className="px-3 py-2 font-medium">Turma</th>
                <th className="px-3 py-2 font-medium">Faltas</th>
                <th className="px-3 py-2 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.matricula_id} className="border-b border-slate-100">
                  <td className="px-3 py-3 font-medium text-slate-900">
                    {aluno.aluno_nome}
                  </td>
                  <td className="px-3 py-3 text-slate-600">{aluno.escola_nome}</td>
                  <td className="px-3 py-3 text-slate-600">
                    {aluno.turma_nome} ({aluno.serie})
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {aluno.total_faltas}/{aluno.total_aulas}
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                      {aluno.percentual_faltas}%
                    </span>
                  </td>
                </tr>
              ))}
              {alunos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                    Nenhum aluno em situação de evasão detectada.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
