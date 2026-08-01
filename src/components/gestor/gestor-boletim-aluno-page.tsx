import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { BoletimIndividualView } from "@/components/professor/boletim-individual-view";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import {
  getEscolaNome,
  loadBoletimAlunoEscola,
  type BoletimAlunoModo,
} from "@/lib/gestor-boletim";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";

const TITULOS: Record<BoletimAlunoModo, { title: string; description: string }> =
  {
    completo: {
      title: "Boletim do Aluno — Completo",
      description:
        "Desempenho consolidado do estudante com disciplinas e professores",
    },
    resumido: {
      title: "Boletim do Aluno — Resumido",
      description: "Visão resumida do desempenho do estudante por disciplina",
    },
  };

export async function GestorBoletimAlunoPage({
  modo,
  searchParams,
}: {
  modo: BoletimAlunoModo;
  searchParams: Promise<{ turma?: string; aluno?: string; bimestre?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getGestorEscolaId(profile);
  const { title, description } = TITULOS[modo];

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title={title}
          description={description}
          actions={<BackLink />}
        />
        <SemEscolaAlert />
      </>
    );
  }

  const { turmas, boletim, matriculaId } = await loadBoletimAlunoEscola(
    escolaId,
    params,
  );
  const escolaNome = await getEscolaNome(escolaId);

  return (
    <>
      <GestorPageHeader
        title={title}
        description={description}
        actions={<BackLink />}
      />

      {turmas.length > 0 ? (
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
              defaultValue={params.turma ?? turmas[0]?.id ?? ""}
              className="h-10 min-w-[240px] rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.label}
                </option>
              ))}
            </select>
          </div>

          {boletim && boletim.alunos.length > 0 ? (
            <div>
              <label
                htmlFor="aluno"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Aluno
              </label>
              <select
                id="aluno"
                name="aluno"
                defaultValue={matriculaId ?? ""}
                className="h-10 min-w-[220px] rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                {boletim.alunos.map((aluno) => (
                  <option key={aluno.matriculaId} value={aluno.matriculaId}>
                    {aluno.nome}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

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
                defaultValue={
                  params.bimestre ?? boletim.bimestres.at(-1)?.id ?? ""
                }
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
            className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399]"
          >
            Consultar boletim
          </button>
        </form>
      ) : (
        <Card className="mb-6">
          <CardTitle>Nenhuma turma cadastrada</CardTitle>
          <CardDescription>
            Cadastre turmas na escola para consultar boletins individuais.
          </CardDescription>
        </Card>
      )}

      {boletim && matriculaId ? (
        <BoletimIndividualView
          boletim={boletim}
          matriculaId={matriculaId}
          bimestreId={params.bimestre}
          escolaNome={escolaNome}
          modo={modo}
        />
      ) : turmas.length > 0 ? (
        <Card>
          <CardTitle>Boletim indisponível</CardTitle>
          <CardDescription>
            Selecione uma turma e um aluno matriculado.
          </CardDescription>
        </Card>
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
