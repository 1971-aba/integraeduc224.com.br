import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { DIAS_SEMANA } from "@/lib/professor-horario";
import type { SlotHorarioEscolar } from "@/lib/gestor-turmas";

export type GrupoHorario = {
  id: string;
  titulo: string;
  subtitulo?: string;
  slots: SlotHorarioEscolar[];
};

type HorarioEscolarGradeProps = {
  grupos: GrupoHorario[];
  /** Informação exibida abaixo da disciplina em cada célula. */
  detalhe: "professor" | "turma";
  emptyTitle: string;
  emptyDescription: string;
};

export function HorarioEscolarGrade({
  grupos,
  detalhe,
  emptyTitle,
  emptyDescription,
}: HorarioEscolarGradeProps) {
  if (grupos.length === 0) {
    return (
      <Card>
        <CardTitle>{emptyTitle}</CardTitle>
        <CardDescription className="mt-2">{emptyDescription}</CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {grupos.map((grupo) => {
        const horarios = [
          ...new Set(grupo.slots.map((slot) => `${slot.horaInicio}-${slot.horaFim}`)),
        ].sort();

        const porCelula = new Map(
          grupo.slots.map((slot) => [
            `${slot.diaIndex}|${slot.horaInicio}-${slot.horaFim}`,
            slot,
          ]),
        );

        return (
          <Card key={grupo.id}>
            <CardTitle>{grupo.titulo}</CardTitle>
            {grupo.subtitulo ? (
              <CardDescription>{grupo.subtitulo}</CardDescription>
            ) : null}

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700">
                      Horário
                    </th>
                    {DIAS_SEMANA.map((dia) => (
                      <th
                        key={dia}
                        className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700"
                      >
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {horarios.map((horario) => (
                    <tr key={horario}>
                      <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-medium text-slate-600">
                        {horario.replace("-", " às ")}
                      </th>
                      {DIAS_SEMANA.map((dia, diaIndex) => {
                        const slot = porCelula.get(`${diaIndex}|${horario}`);

                        return (
                          <td
                            key={`${dia}-${horario}`}
                            className="border border-slate-200 px-3 py-2 align-top"
                          >
                            {slot ? (
                              <>
                                <span className="block font-medium text-slate-800">
                                  {slot.disciplinaNome}
                                </span>
                                <span className="block text-xs text-slate-500">
                                  {detalhe === "professor"
                                    ? slot.professorNome
                                    : `${slot.turmaNome} — ${slot.serie}`}
                                </span>
                              </>
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
          </Card>
        );
      })}
    </div>
  );
}
