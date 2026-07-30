import { BoletimTurmaView } from "@/components/coordenador/boletim-turma-view";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { BoletimTurmaData } from "@/lib/boletim";
import type { BoletimTurmaOption } from "@/lib/boletim";

type FichaNotasProfessorViewProps = {
  titulo: string;
  descricao: string;
  turmas: BoletimTurmaOption[];
  turmaId?: string;
  bimestreId?: string;
  boletim: BoletimTurmaData | null;
};

export function FichaNotasProfessorView({
  titulo,
  descricao,
  turmas,
  turmaId,
  bimestreId,
  boletim,
}: FichaNotasProfessorViewProps) {
  return (
    <>
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
              defaultValue={bimestreId ?? boletim.bimestres.at(-1)?.id ?? ""}
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
          <CardTitle>Sem turmas neste nível</CardTitle>
          <CardDescription>
            Não há turmas vinculadas de {titulo.toLowerCase()} para exibir a
            ficha de notas.
          </CardDescription>
        </Card>
      ) : boletim ? (
        <BoletimTurmaView boletim={boletim} bimestreId={bimestreId} />
      ) : (
        <Card>
          <CardTitle>Ficha indisponível</CardTitle>
          <CardDescription>{descricao}</CardDescription>
        </Card>
      )}
    </>
  );
}
