import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { PlanoSecaoResumo } from "@/lib/professor-planos";

type PlanosSecaoViewProps = {
  planos: PlanoSecaoResumo[];
  novoHref: string;
  emptyTitle: string;
  emptyDescription: string;
  secaoAusenteTexto: string;
};

export function PlanosSecaoView({
  planos,
  novoHref,
  emptyTitle,
  emptyDescription,
  secaoAusenteTexto,
}: PlanosSecaoViewProps) {
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
    <div className="space-y-4">
      {planos.map((plano) => (
        <Card key={plano.id}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{plano.tema}</CardTitle>
              <CardDescription>
                {plano.serie}
                {plano.disciplina ? ` • ${plano.disciplina}` : ""} • atualizado
                em {new Date(plano.updated_at).toLocaleDateString("pt-BR")}
              </CardDescription>
            </div>
            <Link
              href={`/professor/planos/${plano.id}`}
              className="shrink-0 text-sm font-medium text-blue-700 hover:underline"
            >
              Abrir plano
            </Link>
          </div>

          {plano.secao ? (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {plano.secao}
            </p>
          ) : (
            <p className="mt-4 text-sm italic text-slate-500">
              {secaoAusenteTexto}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
