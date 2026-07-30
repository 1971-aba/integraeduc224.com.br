import Link from "next/link";
import { FileText, Plus } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PlanoAulaResumo } from "@/lib/professor-planos";

type PlanosListaViewProps = {
  planos: PlanoAulaResumo[];
  novoHref: string;
  emptyTitle: string;
  emptyDescription: string;
};

export function PlanosListaView({
  planos,
  novoHref,
  emptyTitle,
  emptyDescription,
}: PlanosListaViewProps) {
  if (planos.length === 0) {
    return (
      <Card>
        <CardTitle>{emptyTitle}</CardTitle>
        <CardDescription className="mt-2">{emptyDescription}</CardDescription>
        <Link href={novoHref} className="mt-4 inline-block">
          <Button>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Criar plano
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {planos.map((plano) => (
        <Link key={plano.id} href={`/professor/planos/${plano.id}`}>
          <Card className="h-full transition-shadow hover:shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <CardTitle className="line-clamp-2">{plano.tema}</CardTitle>
            <CardDescription>
              {plano.serie}
              {plano.disciplina ? ` • ${plano.disciplina}` : ""}
            </CardDescription>
            <p className="mt-4 text-xs text-slate-500">
              Atualizado em{" "}
              {new Date(plano.updated_at).toLocaleDateString("pt-BR")}
            </p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
