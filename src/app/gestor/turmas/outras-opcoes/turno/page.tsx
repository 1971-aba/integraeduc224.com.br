import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getRelatorioPorTurma } from "@/lib/gestor-relatorios";
import type { TurmaRelatorio } from "@/lib/gestor-relatorios";

export default async function GestorTurmasPorTurnoPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const turmas = await getRelatorioPorTurma(profile);

  const porTurno = new Map<string, TurmaRelatorio[]>();

  for (const turma of turmas) {
    const atual = porTurno.get(turma.turno) ?? [];
    atual.push(turma);
    porTurno.set(turma.turno, atual);
  }

  const grupos = [...porTurno.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "pt-BR"),
  );

  return (
    <>
      <GestorPageHeader
        title="Turmas por Turno"
        description="Distribuição das turmas e dos estudantes entre os turnos"
      />

      {grupos.length === 0 ? (
        <Card>
          <CardTitle>Nenhuma turma cadastrada</CardTitle>
          <CardDescription className="mt-2">
            Cadastre turmas em Turmas → Cadastro de Turmas.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-4">
          {grupos.map(([turno, turmasDoTurno]) => {
            const alunos = turmasDoTurno.reduce(
              (soma, turma) => soma + turma.totalAlunos,
              0,
            );

            return (
              <Card key={turno}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{turno}</CardTitle>
                    <CardDescription>
                      {turmasDoTurno.length} turma(s) • {alunos} estudante(s)
                    </CardDescription>
                  </div>
                </div>

                <ul className="mt-4 divide-y divide-slate-100 text-sm">
                  {turmasDoTurno.map((turma) => (
                    <li
                      key={turma.turmaId}
                      className="flex flex-wrap items-center justify-between gap-2 py-2"
                    >
                      <span className="font-medium text-slate-800">
                        {turma.turmaNome} — {turma.serie}
                      </span>
                      <span className="text-slate-600">
                        {turma.totalAlunos} estudante(s)
                        {profile.role === "admin_sme"
                          ? ` • ${turma.escolaNome}`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
