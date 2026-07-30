import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getRelatorioPorTurma } from "@/lib/gestor-relatorios";
import {
  agruparVinculosPorTurma,
  getVinculosDocentes,
} from "@/lib/gestor-turmas";

export default async function GestorFormacaoTurmaPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  const [turmas, vinculos] = await Promise.all([
    getRelatorioPorTurma(profile),
    getVinculosDocentes(profile),
  ]);

  const disciplinasPorTurma = new Map(
    agruparVinculosPorTurma(vinculos).map((turma) => [
      turma.turmaId,
      turma.itens.length,
    ]),
  );

  const totalAlunos = turmas.reduce((soma, turma) => soma + turma.totalAlunos, 0);

  return (
    <>
      <GestorPageHeader
        title="Formação de Turma"
        description="Composição das turmas: estudantes matriculados e disciplinas atribuídas"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardDescription>Turmas formadas</CardDescription>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {turmas.length}
          </p>
        </Card>
        <Card>
          <CardDescription>Estudantes matriculados</CardDescription>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {totalAlunos}
          </p>
        </Card>
        <Card>
          <CardDescription>Média por turma</CardDescription>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {turmas.length > 0 ? Math.round(totalAlunos / turmas.length) : 0}
          </p>
        </Card>
      </div>

      {turmas.length === 0 ? (
        <Card>
          <CardTitle>Nenhuma turma cadastrada</CardTitle>
          <CardDescription className="mt-2">
            Cadastre turmas em Turmas → Cadastro de Turmas.
          </CardDescription>
        </Card>
      ) : (
        <Card>
          <CardTitle>Turmas da unidade</CardTitle>
          <CardDescription>
            Ordenadas por série e nome da turma
          </CardDescription>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Turma
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Série
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Turno
                  </th>
                  {profile.role === "admin_sme" ? (
                    <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                      Escola
                    </th>
                  ) : null}
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-semibold text-slate-700">
                    Estudantes
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-semibold text-slate-700">
                    Disciplinas
                  </th>
                </tr>
              </thead>
              <tbody>
                {turmas.map((turma) => (
                  <tr key={turma.turmaId}>
                    <td className="border-b border-slate-100 px-3 py-2 font-medium text-slate-800">
                      {turma.turmaNome}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {turma.serie}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {turma.turno}
                    </td>
                    {profile.role === "admin_sme" ? (
                      <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                        {turma.escolaNome}
                      </td>
                    ) : null}
                    <td className="border-b border-slate-100 px-3 py-2 text-right text-slate-700">
                      {turma.totalAlunos}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-right text-slate-700">
                      {disciplinasPorTurma.get(turma.turmaId) ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
