import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { TurmaComVinculos } from "@/lib/gestor-turmas";

type VinculosTurmaViewProps = {
  turmas: TurmaComVinculos[];
  /** Colunas exibidas em cada turma. */
  mostrarProfessor?: boolean;
  mostrarEscola?: boolean;
  emptyTitle: string;
  emptyDescription: string;
};

export function VinculosTurmaView({
  turmas,
  mostrarProfessor = true,
  mostrarEscola = false,
  emptyTitle,
  emptyDescription,
}: VinculosTurmaViewProps) {
  if (turmas.length === 0) {
    return (
      <Card>
        <CardTitle>{emptyTitle}</CardTitle>
        <CardDescription className="mt-2">{emptyDescription}</CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {turmas.map((turma) => (
        <Card key={turma.turmaId}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>
                {turma.turmaNome} — {turma.serie}
              </CardTitle>
              <CardDescription>
                {turma.turno}
                {mostrarEscola ? ` • ${turma.escolaNome}` : ""}
              </CardDescription>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
              {turma.itens.length} disciplina(s)
            </span>
          </div>

          <ul className="mt-4 divide-y divide-slate-100 text-sm">
            {turma.itens.map((item) => (
              <li
                key={item.atribuicaoId}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <span className="font-medium text-slate-800">
                  {item.disciplinaNome}
                </span>
                {mostrarProfessor ? (
                  <span className="text-slate-600">{item.professorNome}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
