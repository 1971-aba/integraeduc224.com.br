import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FrequenciaMensalView } from "@/components/gestor/frequencia-mensal-view";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getFrequenciaMensalEscola } from "@/lib/gestor-frequencia-mensal";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";

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

export default async function GestorFrequenciaMensalPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getGestorEscolaId(profile);

  const ano = Number(params.ano ?? 2026);
  const mes = Number(params.mes ?? new Date().getMonth() + 1);

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader title="Frequência Mensal 2026" />
        <SemEscolaAlert />
      </>
    );
  }

  const relatorio = await getFrequenciaMensalEscola(escolaId, ano, mes);

  return (
    <>
      <GestorPageHeader
        title="Frequência Mensal 2026"
        description="Consolidado mensal de presença por turma"
        actions={
          <Link
            href="/gestor/relatorios"
            className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Relatórios
          </Link>
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

      {relatorio.turmas.length > 0 ? (
        <FrequenciaMensalView relatorio={relatorio} />
      ) : (
        <Card>
          <CardTitle>Sem dados no período</CardTitle>
          <CardDescription>
            Não há chamadas registradas em {relatorio.mesLabel} de {relatorio.ano}.
          </CardDescription>
        </Card>
      )}
    </>
  );
}
