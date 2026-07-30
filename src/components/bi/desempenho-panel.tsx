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
import type { DesempenhoItem } from "@/lib/bi-types";

type DesempenhoPanelProps = {
  porEscola: Array<{ escola: string; media: number }>;
  porDisciplina: Array<{ disciplina: string; media: number }>;
  itens: DesempenhoItem[];
};

const MEDIA_APROVACAO = 6;
const BAR_OK = "#2563eb";
const BAR_LOW = "#dc2626";

function barColor(media: number) {
  return media >= MEDIA_APROVACAO ? BAR_OK : BAR_LOW;
}

export function DesempenhoPanel({
  porEscola,
  porDisciplina,
  itens,
}: DesempenhoPanelProps) {
  const mediaGeral =
    itens.length > 0
      ? Math.round(
          (itens.reduce((acc, item) => acc + item.media, 0) / itens.length) *
            100,
        ) / 100
      : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle className="text-base">Média geral da rede</CardTitle>
        <p className="mt-2 text-3xl font-bold text-slate-900">
          {mediaGeral ?? "—"}
        </p>
        <CardDescription>
          Com base nos lançamentos de notas filtrados
        </CardDescription>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Média por escola</CardTitle>
          <CardDescription>Desempenho consolidado por unidade</CardDescription>
          <div className="mt-4 h-72">
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
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [`${value}`, "Média"]}
                    contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0" }}
                  />
                  <Bar
                    dataKey="media"
                    radius={[6, 6, 0, 0]}
                    fill={BAR_OK}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Sem notas lançadas para os filtros selecionados.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardTitle>Média por disciplina</CardTitle>
          <CardDescription>Resultados por componente curricular</CardDescription>
          <div className="mt-4 h-72">
            {porDisciplina.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={porDisciplina}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="disciplina"
                    width={110}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}`, "Média"]}
                    contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0" }}
                  />
                  <Bar dataKey="media" radius={[0, 6, 6, 0]}>
                    {porDisciplina.map((entry, index) => (
                      <Cell key={index} fill={barColor(entry.media)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Sem notas lançadas para os filtros selecionados.
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle>Detalhamento</CardTitle>
        <CardDescription>
          Médias por escola, série, disciplina e bimestre
        </CardDescription>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Escola</th>
                <th className="px-3 py-2 font-medium">Série</th>
                <th className="px-3 py-2 font-medium">Disciplina</th>
                <th className="px-3 py-2 font-medium">Bimestre</th>
                <th className="px-3 py-2 font-medium">Média</th>
                <th className="px-3 py-2 font-medium">Notas</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="px-3 py-3 text-slate-900">{item.escola_nome}</td>
                  <td className="px-3 py-3 text-slate-600">{item.serie}</td>
                  <td className="px-3 py-3 text-slate-600">
                    {item.disciplina_nome}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {item.bimestre_numero}º
                  </td>
                  <td className="px-3 py-3 font-semibold">{item.media}</td>
                  <td className="px-3 py-3 text-slate-600">{item.total_notas}</td>
                </tr>
              ))}
              {itens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    Nenhum dado de desempenho disponível.
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
