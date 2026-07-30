import Link from "next/link";

import type { HorarioAulaSlot } from "@/lib/professor-horario";
import { DIAS_SEMANA } from "@/lib/professor-horario";

type HorarioEscolarViewProps = {
  slots: HorarioAulaSlot[];
};

export function HorarioEscolarView({ slots }: HorarioEscolarViewProps) {
  if (slots.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">
        Nenhuma turma vinculada para montar o horário. Aguarde a atribuição
        docente.
      </p>
    );
  }

  const turnos = [...new Set(slots.map((s) => s.turno))];

  return (
    <div className="space-y-8">
      {turnos.map((turno) => {
        const slotsTurno = slots.filter((s) => s.turno === turno);
        const horarios = [
          ...new Set(slotsTurno.map((s) => `${s.horaInicio}–${s.horaFim}`)),
        ].sort();

        return (
          <section key={turno}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#1E7BB8]">
              Turno da {turno}
            </h2>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
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
                  {horarios.map((horario) => (
                    <tr key={horario} className="border-t border-slate-100">
                      <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-600">
                        {horario}
                      </td>
                      {DIAS_SEMANA.map((dia, diaIndex) => {
                        const aula = slotsTurno.find(
                          (s) =>
                            s.diaIndex === diaIndex &&
                            `${s.horaInicio}–${s.horaFim}` === horario,
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
                                  className="mt-1 inline-block text-xs font-medium text-[#1E7BB8] hover:underline"
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
