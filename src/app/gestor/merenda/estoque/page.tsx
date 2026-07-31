import { listMerendaEstoque } from "@/actions/gestor-operacional";
import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import {
  MerendaEstoqueForm,
  MerendaEstoqueListItem,
} from "@/components/gestor/merenda-estoque-panel";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";

export default async function GestorMerendaEstoquePage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader title="Estoque da Escola" />
        <SemEscolaAlert />
      </>
    );
  }

  const itens = await listMerendaEstoque(profile.escola_id);
  const estoqueBaixo = itens.filter(
    (item) => item.quantidade <= item.estoqueMinimo,
  ).length;

  return (
    <>
      <GestorPageHeader
        title="Estoque da Escola"
        description="Insumos e materiais da merenda escolar da unidade"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardDescription>Itens cadastrados</CardDescription>
          <CardTitle className="text-2xl">{itens.length}</CardTitle>
        </Card>
        <Card>
          <CardDescription>Estoque baixo</CardDescription>
          <CardTitle className="text-2xl text-rose-700">{estoqueBaixo}</CardTitle>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardTitle>Insumos em estoque</CardTitle>
          <ul className="mt-4 space-y-3">
            {itens.map((item) => (
              <MerendaEstoqueListItem key={item.id} item={item} />
            ))}
            {itens.length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhum insumo cadastrado.
              </li>
            ) : null}
          </ul>
        </Card>
        <Card>
          <MerendaEstoqueForm />
        </Card>
      </div>
    </>
  );
}
