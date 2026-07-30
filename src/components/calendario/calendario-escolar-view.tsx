import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { CalendarioEscolarData } from "@/lib/calendario-escolar";

type CalendarioEscolarViewProps = {
  calendario: CalendarioEscolarData;
  readOnly?: boolean;
};

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

const TIPO_LABEL: Record<string, string> = {
  feriado: "Feriado",
  recesso: "Recesso",
  evento: "Evento",
  formacao: "Formação",
  outro: "Outro",
};

export function CalendarioEscolarView({
  calendario,
  readOnly = true,
}: CalendarioEscolarViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>Ano letivo {calendario.ano}</CardTitle>
        <CardDescription>
          {readOnly
            ? "Calendário oficial da rede municipal (somente consulta)"
            : "Calendário em vigor na secretaria"}
        </CardDescription>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-4 text-base">Bimestres</CardTitle>
          <ul className="space-y-2 text-sm text-slate-600">
            {calendario.bimestres.length > 0 ? (
              calendario.bimestres.map((bimestre) => (
                <li
                  key={bimestre.numero}
                  className="rounded-lg border border-slate-100 px-3 py-2"
                >
                  <span className="font-medium text-slate-900">
                    {bimestre.numero}º bimestre
                  </span>
                  <span className="block text-slate-600">
                    {formatDate(bimestre.dataInicio)} a{" "}
                    {formatDate(bimestre.dataFim)}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-slate-500">Nenhum bimestre cadastrado.</li>
            )}
          </ul>
        </Card>

        <Card>
          <CardTitle className="mb-4 text-base">Eventos e feriados</CardTitle>
          <ul className="space-y-2 text-sm text-slate-600">
            {calendario.eventos.length > 0 ? (
              calendario.eventos.map((evento, index) => (
                <li
                  key={`${evento.titulo}-${index}`}
                  className="rounded-lg border border-slate-100 px-3 py-2"
                >
                  <span className="font-medium text-slate-900">
                    {evento.titulo}
                  </span>
                  <span className="block text-xs uppercase tracking-wide text-slate-500">
                    {TIPO_LABEL[evento.tipo] ?? evento.tipo} —{" "}
                    {formatDate(evento.dataInicio)}
                    {evento.dataFim !== evento.dataInicio
                      ? ` a ${formatDate(evento.dataFim)}`
                      : ""}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-slate-500">Nenhum evento cadastrado.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
