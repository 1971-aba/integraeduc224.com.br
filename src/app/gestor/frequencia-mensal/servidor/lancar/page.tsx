import { listFrequenciaServidorFaltas } from "@/actions/gestor-frequencia-servidor";
import { listServidoresEscola } from "@/actions/gestor-servidores";
import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import {
  FaltaServidorListItem,
  LancarFaltasServidorForm,
} from "@/components/gestor/frequencia-servidor-panel";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";

export default async function GestorFrequenciaServidorLancarPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data: dataParam } = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const hoje = new Date().toISOString().slice(0, 10);
  const data = dataParam ?? hoje;

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader title="Lançar Faltas Dia" />
        <SemEscolaAlert />
      </>
    );
  }

  const [servidores, faltas] = await Promise.all([
    listServidoresEscola(profile.escola_id),
    listFrequenciaServidorFaltas(profile.escola_id, data),
  ]);

  return (
    <>
      <GestorPageHeader
        title="Lançar Faltas Dia"
        description="Registro diário de faltas dos servidores da unidade"
      />

      <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label htmlFor="data" className="mb-1 block text-sm font-medium text-slate-700">
            Data
          </label>
          <input
            id="data"
            name="data"
            type="date"
            defaultValue={data}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399]"
        >
          Consultar dia
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardTitle>Faltas registradas</CardTitle>
          <CardDescription>
            {faltas.length} registro(s) em{" "}
            {new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR")}
          </CardDescription>
          <ul className="mt-4 space-y-2">
            {faltas.map((item) => (
              <FaltaServidorListItem key={item.id} item={item} />
            ))}
            {faltas.length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhuma falta registrada nesta data.
              </li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <LancarFaltasServidorForm
            servidores={servidores.map((s) => ({ id: s.id, nome: s.nome }))}
          />
        </Card>
      </div>
    </>
  );
}
