import Link from "next/link";

import type { HorarioAulaSlot, PeriodoEscolar } from "@/lib/professor-horario";
import {
  DIAS_SEMANA,
  PERIODOS_MANHA,
  PERIODOS_TARDE,
} from "@/lib/professor-horario";

type HorarioCompletoViewProps = {
  slots: HorarioAulaSlot[];
  professorNome: string;
  escolaNome?: string;
};

const INTERVALO_MANHA = { inicio: "09:30", fim: "09:50" };
const INTERVALO_TARDE = { inicio: "15:30", fim: "15:50" };

function periodosPorTurnoLabel(turno: string): PeriodoEscolar[] {
  const t = turno.toLowerCase();
  if (t.includes("tarde") || t.includes("vespertino")) {
    return PERIODOS_TARDE;
  }
  return PERIODOS_MANHA;
}

function intervaloPorTurnoLabel(turno: string) {
  const t = turno.toLowerCase();
  if (t.includes("tarde") || t.includes("vespertino")) {
    return INTERVALO_TARDE;
  }
  return INTERVALO_MANHA;
}

function resumoHorario(slots: HorarioAulaSlot[]) {
  const turmas = new Set(slots.map((s) => s.turma));
  const disciplinas = new Set(slots.map((s) => s.disciplina));
  return {
    totalAulas: slots.length,
    turmas: turmas.size,
    disciplinas: disciplinas.size,
  };
}

export function HorarioCompletoView({
  slots,
  professorNome,
  escolaNome,
}: HorarioCompletoViewProps) {
  if (slots.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">
        Nenhuma turma vinculada para montar o horário completo. Aguarde a
        atribuição docente.
      </p>
    );
  }

  const turnos = [...new Set(slots.map((s) => s.turno))];
  const resumo = resumoHorario(slots);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Docente
          </p>
          <p className="mt-1 font-semibold text-slate-900">{professorNome}</p>
          {escolaNome ? (
            <p className="mt-0.5 text-sm text-slate-600">{escolaNome}</p>
          ) : null}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Aulas semanais
          </p>
          <p className="mt-1 text-2xl font-bold text-[#1E7BB8]">
            {resumo.totalAulas}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Turmas
          </p>
          <p className="mt-1 text-2xl font-bold text-[#1E7BB8]">
            {resumo.turmas}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Disciplinas
          </p>
          <p className="mt-1 text-2xl font-bold text-[#1E7BB8]">
            {resumo.disciplinas}
          </p>
        </div>
      </div>

      <div className="space-y-8 print:space-y-6">
        {turnos.map((turno) => {
          const slotsTurno = slots.filter((s) => s.turno === turno);
          const periodos = periodosPorTurnoLabel(turno);
          const intervalo = intervaloPorTurnoLabel(turno);

          return (
            <section key={turno} className="print:break-inside-avoid">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#1E7BB8]">
                Turno da {turno}
              </h2>
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">
                        Período
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">
                        Horário
                      </th>
                      {DIAS_SEMANA.map((dia) => (
                        <th
                          key={dia}
                          className="px-3 py-2 text-left font-semibold text-slate-700"
                        >
                          {dia}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periodos.flatMap((periodo) => {
                      const rows = [
                        <tr
                          key={`${turno}-${periodo.numero}`}
                          className="border-t border-slate-100"
                        >
                          <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-700">
                            {periodo.numero}ª aula
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                            {periodo.inicio}–{periodo.fim}
                          </td>
                          {DIAS_SEMANA.map((dia, diaIndex) => {
                            const aula = slotsTurno.find(
                              (s) =>
                                s.diaIndex === diaIndex &&
                                s.horaInicio === periodo.inicio &&
                                s.horaFim === periodo.fim,
                            );
                            return (
                              <td key={dia} className="px-3 py-3 align-top">
                                {aula ? (
                                  <div className="rounded-md border border-[#BBDEFB] bg-[#E3F2FD] p-2">
                                    <p className="font-semibold text-[#0D47A1]">
                                      {aula.disciplina}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      {aula.turma} — {aula.serie}
                                    </p>
                                    <Link
                                      href={`/professor/turma/${aula.atribuicaoId}`}
                                      className="mt-1 inline-block text-xs font-medium text-[#1E7BB8] hover:underline print:hidden"
                                    >
                                      Abrir diário
                                    </Link>
                                  </div>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>,
                      ];

                      if (periodo.numero === 3) {
                        rows.push(
                          <tr
                            key={`${turno}-intervalo`}
                            className="border-t border-slate-100 bg-amber-50/60"
                          >
                            <td className="px-3 py-2 font-medium text-amber-900">
                              Intervalo
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-amber-800">
                              {intervalo.inicio}–{intervalo.fim}
                            </td>
                            <td
                              colSpan={DIAS_SEMANA.length}
                              className="px-3 py-2 text-amber-800"
                            >
                              Recesso
                            </td>
                          </tr>,
                        );
                      }

                      return rows;
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
