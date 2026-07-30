import { Suspense } from "react";

import { BiFilters } from "@/components/bi/bi-filters";
import { DesempenhoPanel } from "@/components/bi/desempenho-panel";
import { EvasaoPanel } from "@/components/bi/evasao-panel";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  agruparEvasaoPorEscola,
  agruparMediaPorDisciplina,
  agruparMediaPorEscola,
  getAlunosEvasao,
  getBiFilterOptions,
  getDesempenhoRede,
} from "@/lib/bi";
import { EVASAO_LIMITE_PERCENTUAL } from "@/lib/bi-types";
import { requireRole } from "@/lib/auth";

export default async function AdminBiPage({
  searchParams,
}: {
  searchParams: Promise<{
    escola_id?: string;
    serie?: string;
    disciplina_id?: string;
    bimestre_id?: string;
  }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["admin_sme"]);

  const filters = {
    escolaId: params.escola_id,
    serie: params.serie,
    disciplinaId: params.disciplina_id,
    bimestreId: params.bimestre_id,
  };

  const [alunosEvasao, desempenho, filterOptions] = await Promise.all([
    getAlunosEvasao(EVASAO_LIMITE_PERCENTUAL),
    getDesempenhoRede(filters),
    getBiFilterOptions(),
  ]);

  const porEscolaEvasao = agruparEvasaoPorEscola(alunosEvasao);
  const porEscolaMedia = agruparMediaPorEscola(desempenho);
  const porDisciplinaMedia = agruparMediaPorDisciplina(desempenho);

  return (
    <DashboardShell
      profile={profile}
      title="Business Intelligence"
      description="Monitoramento de evasão e desempenho da rede municipal"
    >
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Alerta de evasão
        </h2>
        <EvasaoPanel alunos={alunosEvasao} porEscola={porEscolaEvasao} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Desempenho da rede
        </h2>

        <Suspense fallback={null}>
          <BiFilters options={filterOptions} values={filters} />
        </Suspense>

        <div className="mt-4">
          <DesempenhoPanel
            porEscola={porEscolaMedia}
            porDisciplina={porDisciplinaMedia}
            itens={desempenho}
          />
        </div>
      </section>
    </DashboardShell>
  );
}
