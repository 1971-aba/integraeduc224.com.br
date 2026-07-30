import { BoletimTurmaView } from "@/components/coordenador/boletim-turma-view";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getBoletimTurma } from "@/lib/boletim";
import { requireRole } from "@/lib/auth";
import {
  getEscolaIdProfessor,
  getTurmasBoletimProfessor,
  professorTemAcessoTurma,
} from "@/lib/professor-boletim";

export default async function ProfessorBoletinsPage({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string; bimestre?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["professor"]);
  const escolaId = await getEscolaIdProfessor(profile.id);

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title="Boletins e Fichas"
          description="Consulta de notas das suas turmas"
        />
        <Card>
          <CardTitle>Escola não vinculada</CardTitle>
          <CardDescription>
            Seu perfil não possui escola vinculada para consultar boletins.
          </CardDescription>
        </Card>
      </>
    );
  }

  const turmas = await getTurmasBoletimProfessor(profile.id);
  const turmaId = params.turma ?? turmas[0]?.id;

  const temAcesso = turmaId
    ? await professorTemAcessoTurma(profile.id, turmaId)
    : false;

  const boletim =
    turmaId && temAcesso
      ? await getBoletimTurma(escolaId, turmaId, params.bimestre)
      : null;

  return (
    <>
      <GestorPageHeader
        title="Boletins e Fichas"
        description="Boletim consolidado das turmas em que você leciona"
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
            className="h-10 min-w-[240px] rounded-md border border-slate-300 bg-white px-3 text-sm"
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
          <CardTitle>Sem turmas vinculadas</CardTitle>
          <CardDescription>
            Aguarde a coordenação vincular você às turmas para consultar
            boletins.
          </CardDescription>
        </Card>
      ) : boletim ? (
        <BoletimTurmaView boletim={boletim} bimestreId={params.bimestre} />
      ) : null}
    </>
  );
}
