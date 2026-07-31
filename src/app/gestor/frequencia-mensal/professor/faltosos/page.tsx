import { listFrequenciaProfessorFaltosos } from "@/actions/gestor-frequencia-professor";
import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { requireRole } from "@/lib/auth";

const MESES = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

const MESES_LABEL: Record<number, string> = Object.fromEntries(
  MESES.map((item) => [item.value, item.label]),
);

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

export default async function GestorFrequenciaProfessorFaltososPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const params = await searchParams;
  const ano = Number(params.ano ?? 2026);
  const mes = Number(params.mes ?? new Date().getMonth() + 1);
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader title="Consultar Faltosos" />
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
        title="Consultar Faltosos"
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

      <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label htmlFor="ano" className="mb-1 block text-sm font-medium text-slate-700">
            Ano
          </label>
          <select
            id="ano"
            name="ano"
            defaultValue={String(ano)}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
        <div>
          <label htmlFor="mes" className="mb-1 block text-sm font-medium text-slate-700">
            Mês
          </label>
          <select
            id="mes"
            name="mes"
            defaultValue={String(mes)}
            className="h-10 min-w-[160px] rounded-md border border-slate-300 px-3 text-sm"
          >
            {MESES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399]"
        >
          Atualizar
        </button>
      </form>

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
