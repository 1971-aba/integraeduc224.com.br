import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getEscolaBimestreOptions } from "@/lib/coordenador-data";
import {
  agruparRankingNotaDezPorTurma,
  getAlunosNotaDezEscola,
} from "@/lib/gestor-alunos-nota10";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";
import { createClient } from "@/lib/supabase/server";

export default async function GestorAlunoNota10RankingPorTurmaPage({
  searchParams,
}: {
  searchParams: Promise<{ bimestre?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getGestorEscolaId(profile);

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader title="Ranking por Turma" actions={<BackLink />} />
        <SemEscolaAlert />
      </>
    );
  }

  const supabase = await createClient();
  const [alunos, bimestres] = await Promise.all([
    getAlunosNotaDezEscola(escolaId, params.bimestre),
    getEscolaBimestreOptions(supabase, escolaId),
  ]);

  const ranking = agruparRankingNotaDezPorTurma(alunos);

  return (
    <>
      <GestorPageHeader
        title="Ranking por Turma"
        description="Turmas com maior número de alunos com nota 10"
        actions={<BackLink />}
      />

      <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label
            htmlFor="bimestre"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Bimestre
          </label>
          <select
            id="bimestre"
            name="bimestre"
            defaultValue={params.bimestre ?? ""}
            className="h-10 min-w-[180px] rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">Todos os bimestres</option>
            {bimestres.map((bimestre) => (
              <option key={bimestre.id} value={bimestre.id}>
                {bimestre.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-semibold text-white hover:bg-[#186399]"
        >
          Filtrar
        </button>
      </form>

      <Card>
        <CardTitle>Ranking por turma</CardTitle>
        <CardDescription>
          {ranking.length} turma(s) com alunos nota 10 no período
        </CardDescription>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Posição</th>
                <th className="px-3 py-2 font-medium">Turma</th>
                <th className="px-3 py-2 font-medium">Série</th>
                <th className="px-3 py-2 font-medium">Alunos nota 10</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((item, index) => (
                <tr
                  key={item.turmaId}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <td className="px-3 py-3 font-medium text-slate-900">
                    {index + 1}º
                  </td>
                  <td className="px-3 py-3 text-slate-900">{item.turma}</td>
                  <td className="px-3 py-3 text-slate-700">{item.serie}</td>
                  <td className="px-3 py-3 font-semibold text-emerald-700">
                    {item.totalAlunosNotaDez}
                  </td>
                </tr>
              ))}
              {ranking.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Nenhuma turma com alunos nota 10 no período selecionado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function BackLink() {
  return (
    <Link
      href="/gestor/relatorios"
      className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Relatórios
    </Link>
  );
}
