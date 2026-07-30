import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { CalendarioEscolarView } from "@/components/calendario/calendario-escolar-view";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import {
  getCalendarioEscolar,
  getSecretariaIdFromEscola,
} from "@/lib/calendario-escolar";

export default async function ProfessorCalendarioPage() {
  const { profile } = await requireRole(["professor"]);

  const secretariaId = profile.secretaria_id
    ?? (profile.escola_id
      ? await getSecretariaIdFromEscola(profile.escola_id)
      : null);

  const calendario = secretariaId
    ? await getCalendarioEscolar(secretariaId)
    : null;

  return (
    <>
      <GestorPageHeader
        title="Calendário Escolar"
        description="Consulta de bimestres, feriados e eventos oficiais"
      />

      {calendario ? (
        <CalendarioEscolarView calendario={calendario} />
      ) : (
        <Card>
          <CardTitle>Calendário indisponível</CardTitle>
          <CardDescription>
            O ano letivo ainda não foi configurado pela secretaria municipal.
          </CardDescription>
        </Card>
      )}
    </>
  );
}
