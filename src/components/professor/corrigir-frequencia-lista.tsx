import Link from "next/link";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { formatDateInput } from "@/lib/diario-utils";
import type { ChamadaTipo } from "@/lib/chamada-tipos";
import { CHAMADA_TIPOS } from "@/lib/chamada-tipos";

export type ChamadaResumo = {
  id: string;
  data: string;
  tipo: ChamadaTipo;
  observacao: string | null;
};

type CorrigirFrequenciaListaProps = {
  atribuicaoId: string;
  turmaLabel: string;
  chamadas: ChamadaResumo[];
  basePath?: string;
};

const tipoLabels: Record<ChamadaTipo, string> = {
  regular: "Turma",
  complementar: "Ativ. Complementar",
  aee: "AEE",
};

export function CorrigirFrequenciaLista({
  atribuicaoId,
  turmaLabel,
  chamadas,
  basePath = "/professor/frequencia/corrigir",
}: CorrigirFrequenciaListaProps) {
  return (
    <>
      <GestorPageHeader
        title="Corrigir Frequência"
        description={turmaLabel}
      />

      <Link
        href={basePath}
        className="mb-4 inline-flex text-sm font-medium text-blue-700 hover:underline"
      >
        ← Voltar às turmas
      </Link>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Data</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Tipo</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Observação</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {chamadas.map((chamada) => (
              <tr key={chamada.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-900">
                  {formatDateInput(chamada.data)}
                  <span className="ml-2 text-slate-500">{chamada.data}</span>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {tipoLabels[chamada.tipo] ?? chamada.tipo}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {chamada.observacao?.trim() || "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`${basePath}/${atribuicaoId}?data=${chamada.data}&tipo=${chamada.tipo}`}
                    className="font-medium text-[#1E7BB8] hover:underline"
                  >
                    Corrigir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {chamadas.length === 0 ? (
          <p className="px-4 py-10 text-center text-slate-600">
            Nenhuma chamada registrada para esta turma.
          </p>
        ) : null}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Selecione uma data para alterar presenças já lançadas. Tipos:{" "}
        {Object.values(CHAMADA_TIPOS)
          .map((item) => item.label)
          .join(", ")}
        .
      </p>
    </>
  );
}
