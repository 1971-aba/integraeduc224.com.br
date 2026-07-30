import { listMerendaRegistros } from "@/actions/gestor-operacional";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { MerendaForm, MerendaListItem } from "@/components/gestor/merenda-panel";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";

export default async function GestorMerendaPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader title="Controle de Merenda" />
        <Card>
          <CardTitle>Escola não vinculada</CardTitle>
        </Card>
      </>
    );
  }

  const registros = await listMerendaRegistros(profile.escola_id);
  const totalAtendidos = registros.reduce((acc, item) => acc + item.qtdAlunos, 0);
  const hoje = new Date().toISOString().slice(0, 10);
  const registrosHoje = registros.filter((item) => item.data === hoje);

  return (
    <>
      <GestorPageHeader
        title="Controle de Merenda"
        description="Registro de cardápios e alunos atendidos"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardDescription>Registros totais</CardDescription>
          <CardTitle className="text-2xl">{registros.length}</CardTitle>
        </Card>
        <Card>
          <CardDescription>Refeições hoje</CardDescription>
          <CardTitle className="text-2xl">{registrosHoje.length}</CardTitle>
        </Card>
        <Card>
          <CardDescription>Alunos atendidos (total)</CardDescription>
          <CardTitle className="text-2xl">{totalAtendidos}</CardTitle>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardTitle>Histórico de merenda</CardTitle>
          <CardDescription>
            Cardápios servidos por data e refeição
          </CardDescription>
          <ul className="mt-4 space-y-2">
            {registros.map((item) => (
              <MerendaListItem key={item.id} item={item} />
            ))}
            {registros.length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhum registro de merenda.
              </li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <MerendaForm />
        </Card>
      </div>
    </>
  );
}
