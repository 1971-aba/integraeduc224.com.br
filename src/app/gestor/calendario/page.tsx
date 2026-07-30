import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { CalendarioEscolarView } from "@/components/calendario/calendario-escolar-view";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import {
  getCalendarioEscolar,
  getSecretariaIdFromEscola,
} from "@/lib/calendario-escolar";
import { createClient } from "@/lib/supabase/server";

export default async function GestorCalendarioPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
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
            Não há ano letivo ativo cadastrado pela secretaria. Solicite ao
            administrador SME a configuração em Admin → Calendário Letivo.
          </CardDescription>
        </Card>
      )}
    </>
  );
}
