import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { BoletimIndividualView } from "@/components/professor/boletim-individual-view";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getBoletimTurma } from "@/lib/boletim";
import { requireRole } from "@/lib/auth";
import {
  getEscolaIdProfessor,
  getTurmasBoletimProfessor,
  professorTemAcessoTurma,
} from "@/lib/professor-boletim";
import { createClient } from "@/lib/supabase/server";

export default async function BoletimIndividualPage({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string; aluno?: string; bimestre?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["professor"]);
  const escolaId = await getEscolaIdProfessor(profile.id);

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title="Boletim Individual"
          description="Boletim escolar completo do estudante"
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

  const matriculaId =
    params.aluno ?? boletim?.alunos[0]?.matriculaId ?? undefined;

  const supabase = await createClient();
  const { data: escola } = await supabase
    .from("escolas")
    .select("nome")
    .eq("id", escolaId)
    .maybeSingle();

  return (
    <>
      <GestorPageHeader
        title="Boletim Individual"
        description="Desempenho consolidado do estudante em todas as disciplinas da turma"
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
          <CardTitle>Sem turmas vinculadas</CardTitle>
          <CardDescription>
            Aguarde a atribuição docente para consultar boletins individuais.
          </CardDescription>
        </Card>
      )}

      {boletim && matriculaId ? (
        <BoletimIndividualView
          boletim={boletim}
          matriculaId={matriculaId}
          bimestreId={params.bimestre}
          escolaNome={escola?.nome ?? "Unidade Escolar"}
        />
      ) : turmas.length > 0 ? (
        <Card>
          <CardTitle>Boletim indisponível</CardTitle>
          <CardDescription>
            Selecione uma turma vinculada e um aluno matriculado.
          </CardDescription>
        </Card>
      ) : null}
    </>
  );
}
