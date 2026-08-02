import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { CalendarioEscolarView } from "@/components/calendario/calendario-escolar-view";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import {
  getCalendarioEscolar,
  getSecretariaIdFromEscola,
} from "@/lib/calendario-escolar";
import { createClient } from "@/lib/supabase/server";

export default async function CoordenadorCalendarioPage() {
  const { profile } = await requireRole(["coordenador", "admin_sme"]);
  const supabase = await createClient();

  let secretariaId = profile.secretaria_id;

  if (!secretariaId && profile.escola_id) {
    secretariaId = await getSecretariaIdFromEscola(profile.escola_id);
  }

  if (!secretariaId && profile.role === "admin_sme") {
    const { data: secretaria } = await supabase
      .from("secretarias")
      .select("id")
      .limit(1)
      .maybeSingle();
    secretariaId = secretaria?.id ?? null;
  }

  const calendario = secretariaId
    ? await getCalendarioEscolar(secretariaId)
    : null;

  return (
    <>
      <GestorPageHeader
        title="Calendário Escolar"
        description="Bimestres, feriados e eventos do ano letivo vigente"
      />

      {calendario ? (
        <CalendarioEscolarView calendario={calendario} />
      ) : (
        <Card>
          <CardTitle>Calendário indisponível</CardTitle>
          <CardDescription>
            Não foi possível carregar o calendário da secretaria vinculada à
            escola.
          </CardDescription>
        </Card>
      )}
    </>
  );
}
