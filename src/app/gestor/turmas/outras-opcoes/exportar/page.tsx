import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getRelatorioPorTurma } from "@/lib/gestor-relatorios";
import {
  agruparVinculosPorTurma,
  getVinculosDocentes,
} from "@/lib/gestor-turmas";

export default async function GestorExportarTurmasPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  const [turmas, vinculos] = await Promise.all([
    getRelatorioPorTurma(profile),
    getVinculosDocentes(profile),
  ]);

  const porTurma = new Map(
    agruparVinculosPorTurma(vinculos).map((turma) => [turma.turmaId, turma]),
  );

  const rows = turmas.map((turma) => {
    const agrupado = porTurma.get(turma.turmaId);

    return {
      Escola: turma.escolaNome,
      Turma: turma.turmaNome,
      Serie: turma.serie,
      Turno: turma.turno,
      Estudantes: String(turma.totalAlunos),
      Disciplinas: String(agrupado?.itens.length ?? 0),
      Professores: String(
        new Set(agrupado?.itens.map((item) => item.professorNome) ?? []).size,
      ),
    };
  });

  return (
    <>
      <GestorPageHeader
        title="Exportar Relação de Turmas"
        description="Planilha com turmas, estudantes matriculados e vínculos docentes"
        actions={
          <ExportarCsv rows={rows} filename="relacao-de-turmas.csv" />
        }
      />

      {rows.length === 0 ? (
        <Card>
          <CardTitle>Nenhuma turma para exportar</CardTitle>
          <CardDescription className="mt-2">
            Cadastre turmas em Turmas → Cadastro de Turmas.
          </CardDescription>
        </Card>
      ) : (
        <Card>
          <CardTitle>Pré-visualização</CardTitle>
          <CardDescription>{rows.length} turma(s) na planilha</CardDescription>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr>
                  {Object.keys(rows[0]).map((coluna) => (
                    <th
                      key={coluna}
                      className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700"
                    >
                      {coluna}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.Turma}-${index}`}>
                    {Object.keys(rows[0]).map((coluna) => (
                      <td
                        key={coluna}
                        className="border-b border-slate-100 px-3 py-2 text-slate-700"
                      >
                        {row[coluna as keyof typeof row]}
                      </td>
                    ))}
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
