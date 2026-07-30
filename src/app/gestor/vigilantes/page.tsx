import { listEscalaVigilantes } from "@/actions/gestor-operacional";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import {
  EscalaVigilanteForm,
  EscalaVigilanteItem,
} from "@/components/gestor/escala-vigilantes-panel";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";

export default async function GestorVigilantesPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader title="Escala de Vigilantes" />
        <Card>
          <CardTitle>Escola não vinculada</CardTitle>
        </Card>
      </>
    );
  }

  const escala = await listEscalaVigilantes(profile.escola_id, params.data);

  return (
    <>
      <GestorPageHeader
        title="Escala de Vigilantes"
        description="Plantão e postos de vigilância da unidade escolar"
      />

      <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label
            htmlFor="data"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Filtrar por data
          </label>
          <input
            id="data"
            name="data"
            type="date"
            defaultValue={params.data ?? ""}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399]"
        >
          Filtrar
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardTitle>Escala cadastrada</CardTitle>
          <CardDescription>{escala.length} registro(s)</CardDescription>
          <ul className="mt-4 space-y-2">
            {escala.map((item) => (
              <EscalaVigilanteItem key={item.id} item={item} />
            ))}
            {escala.length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhuma escala cadastrada.
              </li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <EscalaVigilanteForm />
        </Card>
      </div>
    </>
  );
}
