import Link from "next/link";
import { Plus } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { PlanosListaView } from "@/components/professor/planos-lista-view";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import {
  filtrarPlanosPorNivel,
  getPlanosProfessor,
  tituloNivelPlano,
} from "@/lib/professor-planos";

export default async function PlanosInfantilPage() {
  const { profile } = await requireRole(["professor"]);
  const planos = filtrarPlanosPorNivel(
    await getPlanosProfessor(profile.id),
    "infantil",
  );
  const titulo = tituloNivelPlano("infantil");

  return (
    <>
      <GestorPageHeader
        title={`Plano de Aula — ${titulo}`}
        description={`Planos de aula produzidos para turmas da ${titulo.toLowerCase()}`}
        actions={
          <Link href="/professor/planos/novo?nivel=infantil">
            <Button>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Novo plano
            </Button>
          </Link>
        }
      />

      <PlanosListaView
        planos={planos}
        novoHref="/professor/planos/novo?nivel=infantil"
        emptyTitle={`Nenhum plano em ${titulo}`}
        emptyDescription={`Gere planos de aula para séries da ${titulo.toLowerCase()} com assistente IA alinhado à BNCC.`}
      />
    </>
  );
}
