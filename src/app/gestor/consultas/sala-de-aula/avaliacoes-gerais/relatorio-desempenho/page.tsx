import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { RelatorioAvaliativoView } from "@/components/coordenador/relatorio-avaliativo-view";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";
import {
  getBimestresEscolaAtiva,
  getRelatorioAvaliativoEscola,
} from "@/lib/relatorio-avaliativo";

export default async function GestorSalaDeAulaRelatorioDesempenhoPage({
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
        <GestorPageHeader
          title="Relatório Desempenho"
          description="Indicadores de desempenho por turma e disciplina"
          actions={<BackLink />}
        />
        <SemEscolaAlert />
      </>
    );
  }

  const bimestres = await getBimestresEscolaAtiva(escolaId);
  const bimestreId = params.bimestre ?? bimestres.at(-1)?.id;
  const relatorio = await getRelatorioAvaliativoEscola(escolaId, bimestreId);

  return (
    <>
      <GestorPageHeader
        title="Relatório Desempenho"
        description="Panorama pedagógico da unidade escolar"
        actions={<BackLink />}
      />

      {bimestres.length > 0 ? (
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
              defaultValue={bimestreId ?? ""}
              className="h-10 min-w-[160px] rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              {bimestres.map((bimestre) => (
                <option key={bimestre.id} value={bimestre.id}>
                  {bimestre.numero}º bimestre
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399]"
          >
            Atualizar
          </button>
        </form>
      ) : null}

      {relatorio.turmas.length > 0 ? (
        <RelatorioAvaliativoView relatorio={relatorio} />
      ) : (
        <Card>
          <CardTitle>Sem dados avaliativos</CardTitle>
          <CardDescription>
            Lance notas nos diários para consolidar o relatório da escola.
          </CardDescription>
        </Card>
      )}
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
