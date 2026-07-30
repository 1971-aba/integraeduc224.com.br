import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  AtivarAnoButton,
  CalendarioForms,
} from "@/components/admin/calendario-forms";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCalendarioPage() {
  const { profile } = await requireRole(["admin_sme"]);
  const supabase = await createClient();

  let anosQuery = supabase
    .from("anos_letivos")
    .select("id, ano, ativo")
    .order("ano", { ascending: false });

  if (profile.secretaria_id) {
    anosQuery = anosQuery.eq("secretaria_id", profile.secretaria_id);
  }

  const [{ data: anosLetivos }, { data: bimestres }, { data: eventos }] =
    await Promise.all([
      anosQuery,
      supabase
        .from("bimestres")
        .select("ano_letivo_id, numero, data_inicio, data_fim")
        .order("numero"),
      supabase
        .from("calendario_eventos")
        .select("ano_letivo_id, titulo, data_inicio, data_fim, tipo")
        .order("data_inicio"),
    ]);

  const anosOptions =
    anosLetivos?.map((ano) => ({
      id: ano.id,
      label: `${ano.ano}${ano.ativo ? " (ativo)" : ""}`,
    })) ?? [];

  const anoAtivoId = anosLetivos?.find((ano) => ano.ativo)?.id;

  return (
    <DashboardShell
      profile={profile}
      title="Calendário Letivo"
      description="Anos letivos, bimestres e eventos oficiais da rede"
    >
      <CalendarioForms anosLetivos={anosOptions} anoAtivoId={anoAtivoId} />

      <div className="space-y-4">
        {anosLetivos?.map((ano) => {
          const bimestresAno =
            bimestres?.filter((item) => item.ano_letivo_id === ano.id) ?? [];
          const eventosAno =
            eventos?.filter((item) => item.ano_letivo_id === ano.id) ?? [];

          return (
            <Card key={ano.id}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle>Ano letivo {ano.ano}</CardTitle>
                  <CardDescription>
                    {ano.ativo ? "Calendário ativo" : "Calendário arquivado"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {ano.ativo ? (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      Em vigor
                    </span>
                  ) : (
                    <AtivarAnoButton anoLetivoId={ano.id} />
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <section>
                  <h4 className="mb-3 text-sm font-semibold text-slate-900">
                    Bimestres
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {bimestresAno.length > 0 ? (
                      bimestresAno.map((bimestre) => (
                        <li
                          key={bimestre.numero}
                          className="rounded-lg border border-slate-100 px-3 py-2"
                        >
                          {bimestre.numero}º bimestre —{" "}
                          {formatDate(bimestre.data_inicio)} a{" "}
                          {formatDate(bimestre.data_fim)}
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500">
                        Nenhum bimestre cadastrado.
                      </li>
                    )}
                  </ul>
                </section>

                <section>
                  <h4 className="mb-3 text-sm font-semibold text-slate-900">
                    Eventos
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {eventosAno.length > 0 ? (
                      eventosAno.map((evento, index) => (
                        <li
                          key={`${evento.titulo}-${index}`}
                          className="rounded-lg border border-slate-100 px-3 py-2"
                        >
                          <span className="font-medium text-slate-900">
                            {evento.titulo}
                          </span>
                          <span className="block text-xs uppercase tracking-wide text-slate-500">
                            {evento.tipo} — {formatDate(evento.data_inicio)}
                            {evento.data_fim !== evento.data_inicio
                              ? ` a ${formatDate(evento.data_fim)}`
                              : ""}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500">
                        Nenhum evento cadastrado.
                      </li>
                    )}
                  </ul>
                </section>
              </div>
            </Card>
          );
        }) ?? (
          <Card>
            <CardTitle>Sem calendários</CardTitle>
            <CardDescription>
              Cadastre o primeiro ano letivo usando o formulário acima.
            </CardDescription>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}
