import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { BoletimTurmaView } from "@/components/coordenador/boletim-turma-view";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getBoletimTurma, getTurmasBoletimEscola } from "@/lib/boletim";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";

export default async function GestorSalaDeAulaFichaDeAvaliacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string; bimestre?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getGestorEscolaId(profile);

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title="Ficha de Avaliações"
          description="Notas consolidadas por turma e bimestre"
          actions={<BackLink />}
        />
        <SemEscolaAlert />
      </>
    );
  }

  const turmas = await getTurmasBoletimEscola(escolaId);
  const turmaId = params.turma ?? turmas[0]?.id;
  const boletim = turmaId
    ? await getBoletimTurma(escolaId, turmaId, params.bimestre)
    : null;

  return (
    <>
      <GestorPageHeader
        title="Ficha de Avaliações"
        description="Consulta de notas lançadas pelos professores"
        actions={<BackLink />}
      />

      <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label
            htmlFor="turma"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Turma
          </label>
          <select
            id="turma"
            name="turma"
            defaultValue={turmaId ?? ""}
            className="h-10 min-w-[220px] rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.label}
              </option>
            ))}
          </select>
        </div>

        {boletim && boletim.bimestres.length > 0 ? (
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
              defaultValue={params.bimestre ?? boletim.bimestres.at(-1)?.id ?? ""}
              className="h-10 min-w-[160px] rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              {boletim.bimestres.map((bimestre) => (
                <option key={bimestre.id} value={bimestre.id}>
                  {bimestre.numero}º bimestre
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-semibold text-white hover:bg-[#186399]"
        >
          Consultar
        </button>
      </form>

      {turmas.length === 0 ? (
        <Card>
          <CardTitle>Nenhuma turma cadastrada</CardTitle>
          <CardDescription>
            Cadastre turmas na escola para visualizar fichas de avaliações.
          </CardDescription>
        </Card>
      ) : boletim ? (
        <BoletimTurmaView boletim={boletim} bimestreId={params.bimestre} />
      ) : null}
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
