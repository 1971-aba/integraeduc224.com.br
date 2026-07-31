import { listAlmoxarifadoItensRede } from "@/actions/gestor-estrutura-almoxarifado";
import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  ALMOXARIFADO_CATEGORIA_LABEL,
} from "@/lib/gestor-modulos-types";
import { requireRole } from "@/lib/auth";

export default async function GestorAlmoxarifadoRedePage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader title="Estoque da Rede" />
        <SemEscolaAlert />
      </>
    );
  }

  const itens = await listAlmoxarifadoItensRede(profile.escola_id);
  const escolas = new Set(itens.map((item) => item.escolaNome)).size;
  const estoqueBaixo = itens.filter(
    (i) => i.quantidade <= i.estoqueMinimo,
  ).length;

  return (
    <>
      <GestorPageHeader
        title="Estoque da Rede"
        description="Consulta consolidada do estoque das unidades da rede municipal"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardDescription>Itens na rede</CardDescription>
          <CardTitle className="text-2xl">{itens.length}</CardTitle>
        </Card>
        <Card>
          <CardDescription>Unidades</CardDescription>
          <CardTitle className="text-2xl">{escolas}</CardTitle>
        </Card>
        <Card>
          <CardDescription>Estoque baixo</CardDescription>
          <CardTitle className="text-2xl text-rose-700">{estoqueBaixo}</CardTitle>
        </Card>
      </div>

      <Card>
        <CardTitle>Estoque por escola</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Escola</th>
                <th className="px-3 py-2 font-medium">Item</th>
                <th className="px-3 py-2 font-medium">Categoria</th>
                <th className="px-3 py-2 font-medium">Quantidade</th>
                <th className="px-3 py-2 font-medium">Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <td className="px-3 py-3 text-slate-900">{item.escolaNome}</td>
                  <td className="px-3 py-3 font-medium text-slate-900">
                    {item.nome}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {ALMOXARIFADO_CATEGORIA_LABEL[item.categoria] ??
                      item.categoria}
                  </td>
                  <td
                    className={`px-3 py-3 font-semibold ${
                      item.quantidade <= item.estoqueMinimo
                        ? "text-rose-600"
                        : "text-slate-900"
                    }`}
                  >
                    {item.quantidade} {item.unidade}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {item.estoqueMinimo}
                  </td>
                </tr>
              ))}
              {itens.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Nenhum item cadastrado na rede.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
