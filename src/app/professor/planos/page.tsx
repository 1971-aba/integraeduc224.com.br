import Link from "next/link";
import { Plus } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { PlanosListaView } from "@/components/professor/planos-lista-view";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { getPlanosProfessor } from "@/lib/professor-planos";

export default async function PlanosListPage() {
  const { profile } = await requireRole(["professor"]);
  const planos = await getPlanosProfessor(profile.id);

  return (
    <>
      <GestorPageHeader
        title="Planos de Aula"
        description="Assistente pedagógico com IA alinhado à BNCC"
        actions={
          <Link href="/professor/planos/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Novo plano
            </Button>
          </Link>
        }
      />

      {planos.length === 0 ? (
        <PlanosListaView
          planos={[]}
          novoHref="/professor/planos/novo"
          emptyTitle="Nenhum plano criado"
          emptyDescription="Gere seu primeiro plano de aula informando o tema e a série. A IA elaborará objetivos, habilidades BNCC, metodologia e avaliação — prontos para revisão e exportação em PDF."
        />
      ) : (
        <PlanosListaView
          planos={planos}
          novoHref="/professor/planos/novo"
          emptyTitle="Nenhum plano criado"
          emptyDescription=""
        />
      )}
    </>
  );
}
