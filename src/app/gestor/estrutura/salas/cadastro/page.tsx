import { listEstruturaEscolar } from "@/actions/gestor-estrutura-almoxarifado";
import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import {
  EstruturaForm,
  EstruturaListItem,
} from "@/components/gestor/estrutura-panel";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";

export default async function CadastroSalasPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader
          title="Cadastro e Consultas"
          description="Salas e dependências da unidade"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const itens = await listEstruturaEscolar(profile.escola_id);

  return (
    <>
      <GestorPageHeader
        title="Cadastro e Consultas"
        description="Salas de aula, laboratórios, biblioteca e demais dependências"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardTitle>Espaços cadastrados</CardTitle>
          <CardDescription>{itens.length} registro(s)</CardDescription>
          <ul className="mt-4 space-y-2">
            {itens.map((item) => (
              <EstruturaListItem key={item.id} item={item} />
            ))}
            {itens.length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhum espaço cadastrado.
              </li>
            ) : null}
          </ul>
        </Card>
        <Card>
          <EstruturaForm />
        </Card>
      </div>
    </>
  );
}
