import {
  listReunioesEscola,
} from "@/actions/gestor-administracao";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { ReuniaoForm } from "@/components/gestor/reuniao-form";
import { ReuniaoListItem } from "@/components/gestor/reuniao-list-item";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";

export default async function GestorReunioesPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader title="Reuniões e Eventos" />
        <Card>
          <CardTitle>Escola não vinculada</CardTitle>
          <CardDescription>
            Vincule o gestor a uma unidade escolar para gerenciar reuniões.
          </CardDescription>
        </Card>
      </>
    );
  }

  const reunioes = await listReunioesEscola(profile.escola_id);

  return (
    <>
      <GestorPageHeader
        title="Reuniões e Eventos"
        description="Agenda de reuniões pedagógicas e encontros escolares"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardTitle>Agenda da escola</CardTitle>
          <CardDescription>
            {reunioes.length} reunião(ões) agendada(s)
          </CardDescription>
          <ul className="mt-4 space-y-3">
            {reunioes.map((reuniao) => (
              <ReuniaoListItem key={reuniao.id} reuniao={reuniao} />
            ))}
            {reunioes.length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhuma reunião cadastrada.
              </li>
            ) : null}
          </ul>
        </Card>

        <ReuniaoForm />
      </div>
    </>
  );
}
