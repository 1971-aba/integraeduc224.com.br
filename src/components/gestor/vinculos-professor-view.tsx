import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { ProfessorComVinculos } from "@/lib/gestor-turmas";

type VinculosProfessorViewProps = {
  professores: ProfessorComVinculos[];
  emptyTitle: string;
  emptyDescription: string;
};

export function VinculosProfessorView({
  professores,
  emptyTitle,
  emptyDescription,
}: VinculosProfessorViewProps) {
  if (professores.length === 0) {
    return (
      <Card>
        <CardTitle>{emptyTitle}</CardTitle>
        <CardDescription className="mt-2">{emptyDescription}</CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {professores.map((professor) => (
        <Card key={professor.professorId}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle>{professor.professorNome}</CardTitle>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
              {professor.itens.length} vínculo(s)
            </span>
          </div>

          <ul className="mt-4 divide-y divide-slate-100 text-sm">
            {professor.itens.map((item) => (
              <li
                key={item.atribuicaoId}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <span className="font-medium text-slate-800">
                  {item.disciplinaNome}
                </span>
                <span className="text-slate-600">
                  {item.turmaNome} — {item.serie} ({item.turno})
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
