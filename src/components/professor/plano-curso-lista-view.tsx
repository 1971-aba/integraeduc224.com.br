import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PlanoCursoResumo } from "@/lib/professor-plano-curso";

type PlanoCursoListaViewProps = {
  planos: PlanoCursoResumo[];
  nivelLabel: string;
  novoHref: string;
};

export function PlanoCursoListaView({
  planos,
  nivelLabel,
  novoHref,
}: PlanoCursoListaViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href={novoHref}>
          <Button>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Novo plano de curso
          </Button>
        </Link>
      </div>

      {planos.length === 0 ? (
        <Card>
          <CardTitle>Nenhum plano de curso em {nivelLabel}</CardTitle>
          <CardDescription className="mt-2">
            Elabore o plano anual da disciplina com estrutura BNCC por bimestre,
            metodologia e avaliação.
          </CardDescription>
          <Link href={novoHref} className="mt-4 inline-block">
            <Button>Criar plano de curso</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {planos.map((plano) => (
            <Link key={plano.id} href={`/professor/planos/curso/${plano.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#E3F2FD] text-[#1E7BB8]">
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                </div>
                <CardTitle className="line-clamp-2">{plano.titulo}</CardTitle>
                <CardDescription>
                  {plano.disciplina} — {plano.serie}
                </CardDescription>
                <p className="mt-4 text-xs text-slate-500">
                  Atualizado em{" "}
                  {new Date(plano.updated_at).toLocaleDateString("pt-BR")}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
