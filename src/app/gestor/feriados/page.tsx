import { listFolgasEscola } from "@/actions/gestor-entrada-feriados";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import {
  FeriadosOficiaisList,
  FolgaEscolarForm,
  FolgaListItem,
} from "@/components/gestor/feriados-folgas-panel";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getSecretariaIdFromEscola } from "@/lib/calendario-escolar";
import { getFeriadosOficiais } from "@/lib/gestor-entrada-feriados";

export default async function GestorFeriadosPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader title="Feriados e Folgas" />
        <Card>
          <CardTitle>Escola não vinculada</CardTitle>
        </Card>
      </>
    );
  }

  const secretariaId =
    profile.secretaria_id ??
    (await getSecretariaIdFromEscola(profile.escola_id));

  const [feriadosOficiais, folgasEscola] = await Promise.all([
    secretariaId ? getFeriadosOficiais(secretariaId) : Promise.resolve([]),
    listFolgasEscola(profile.escola_id),
  ]);

  return (
    <>
      <GestorPageHeader
        title="Feriados e Folgas"
        description="Calendário oficial da rede e folgas da unidade escolar"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Feriados e recessos (rede)</CardTitle>
          <CardDescription>
            Datas cadastradas pela secretaria municipal
          </CardDescription>
          <div className="mt-4">
            <FeriadosOficiaisList eventos={feriadosOficiais} />
          </div>
        </Card>

        <Card>
          <CardTitle>Folgas da escola</CardTitle>
          <CardDescription>
            Suspensões de aula ou expediente reduzido
          </CardDescription>
          <ul className="mt-4 space-y-2">
            {folgasEscola.map((folga) => (
              <FolgaListItem key={folga.id} folga={folga} />
            ))}
            {folgasEscola.length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhuma folga local cadastrada.
              </li>
            ) : null}
          </ul>
          <div className="mt-6 border-t border-slate-100 pt-6">
            <FolgaEscolarForm />
          </div>
        </Card>
      </div>
    </>
  );
}
