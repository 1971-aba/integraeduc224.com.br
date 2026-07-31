import { listFrequenciaProfessorFaltosos } from "@/actions/gestor-frequencia-professor";
import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { requireRole } from "@/lib/auth";

const MESES_LABEL: Record<number, string> = {
  1: "Janeiro",
  2: "Fevereiro",
  3: "Março",
  4: "Abril",
  5: "Maio",
  6: "Junho",
  7: "Julho",
  8: "Agosto",
  9: "Setembro",
  10: "Outubro",
  11: "Novembro",
  12: "Dezembro",
};

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

export default async function GestorFrequenciaProfessorFaltososMesPage({
  params,
}: {
  params: Promise<{ ano: string; mes: string }>;
}) {
  const { ano: anoParam, mes: mesParam } = await params;
  const ano = Number(anoParam);
  const mes = Number(mesParam);
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader title={`Gerar: ${mes}/${ano}`} />
        <SemEscolaAlert />
      </>
    );
  }

  const faltosos = await listFrequenciaProfessorFaltosos(
    profile.escola_id,
    ano,
    mes,
  );

  const linhasCsv = faltosos.map((item) => ({
    Professor: item.professorNome,
    "Total de faltas": String(item.totalFaltas),
    Datas: item.datas.map(formatDate).join("; "),
  }));

  const mesLabel = MESES_LABEL[mes] ?? String(mes);

  return (
    <>
      <GestorPageHeader
        title={`Gerar: ${mes}/${ano}`}
        description={`Professores faltosos em ${mesLabel} de ${ano}`}
        actions={
          linhasCsv.length > 0 ? (
            <ExportarCsv
              rows={linhasCsv}
              filename={`faltosos-professor-${mes}-${ano}.csv`}
              label={`Exportar CSV (${linhasCsv.length})`}
            />
          ) : undefined
        }
      />

      <Card>
        <CardTitle>Consultar faltosos</CardTitle>
        <CardDescription>
          {faltosos.length} professor(es) com falta(s) no período
        </CardDescription>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Professor</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-3 py-2 font-medium">Datas</th>
              </tr>
            </thead>
            <tbody>
              {faltosos.map((item) => (
                <tr
                  key={`${item.professorId ?? item.professorNome}`}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <td className="px-3 py-3 font-medium text-slate-900">
                    {item.professorNome}
                  </td>
                  <td className="px-3 py-3 text-slate-900">{item.totalFaltas}</td>
                  <td className="px-3 py-3 text-slate-600">
                    {item.datas.map(formatDate).join(", ")}
                  </td>
                </tr>
              ))}
              {faltosos.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Nenhum professor faltoso neste mês.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
