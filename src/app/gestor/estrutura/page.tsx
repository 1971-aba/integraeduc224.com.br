import { listEstruturaEscolar } from "@/actions/gestor-estrutura-almoxarifado";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import {
  EstruturaForm,
  EstruturaListItem,
} from "@/components/gestor/estrutura-panel";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { ESTRUTURA_TIPO_LABEL } from "@/lib/gestor-modulos-types";

export default async function GestorEstruturaPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader title="Estrutura e Outros" />
        <Card><CardTitle>Escola não vinculada</CardTitle></Card>
      </>
    );
  }

  const itens = await listEstruturaEscolar(profile.escola_id);
  const porTipo = Object.keys(ESTRUTURA_TIPO_LABEL).map((tipo) => ({
    tipo,
    count: itens.filter((i) => i.tipo === tipo).length,
  })).filter((t) => t.count > 0);

  return (
    <>
      <GestorPageHeader
        title="Estrutura e Outros"
        description="Salas, espaços e capacidade da unidade escolar"
      />

      {porTipo.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {porTipo.map((item) => (
            <span
              key={item.tipo}
              className="rounded-full bg-[#E3F2FD] px-3 py-1 text-xs font-medium text-[#1565C0]"
            >
              {ESTRUTURA_TIPO_LABEL[item.tipo as keyof typeof ESTRUTURA_TIPO_LABEL]}: {item.count}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardTitle>Espaços cadastrados</CardTitle>
          <CardDescription>{itens.length} registro(s)</CardDescription>
          <ul className="mt-4 space-y-2">
            {itens.map((item) => (
              <EstruturaListItem key={item.id} item={item} />
            ))}
            {itens.length === 0 ? (
              <li className="text-sm text-slate-500">Nenhum espaço cadastrado.</li>
            ) : null}
          </ul>
        </Card>
        <Card><EstruturaForm /></Card>
      </div>
    </>
  );
}
