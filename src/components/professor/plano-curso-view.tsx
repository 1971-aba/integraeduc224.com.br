import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PlanoCursoGrupo } from "@/lib/professor-planos";

type PlanoCursoViewProps = {
  grupos: PlanoCursoGrupo[];
  novoHref: string;
  nivelLabel: string;
};

export function PlanoCursoView({
  grupos,
  novoHref,
  nivelLabel,
}: PlanoCursoViewProps) {
  if (grupos.length === 0) {
    return (
      <Card>
        <CardTitle>Nenhum plano de curso registrado</CardTitle>
        <CardDescription className="mt-2">
          Crie planos de aula em {nivelLabel} para montar o panorama do curso
          por disciplina e série.
        </CardDescription>
        <Link href={novoHref} className="mt-4 inline-block">
          <Button>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Novo plano de aula
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href={novoHref}>
          <Button>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Adicionar plano
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {grupos.map((grupo) => (
          <Card key={`${grupo.disciplina}-${grupo.serie}`}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#E3F2FD] text-[#1E7BB8]">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <CardTitle>{grupo.disciplina}</CardTitle>
            <CardDescription>{grupo.serie}</CardDescription>
            <dl className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Planos de aula</dt>
                <dd className="font-semibold text-slate-900">
                  {grupo.totalPlanos}
                </dd>
              </div>
              {grupo.ultimoTema ? (
                <div>
                  <dt className="text-xs text-slate-500">Último tema</dt>
                  <dd className="mt-0.5 line-clamp-2">{grupo.ultimoTema}</dd>
                </div>
              ) : null}
              {grupo.ultimaAtualizacao ? (
                <div className="text-xs text-slate-500">
                  Atualizado em{" "}
                  {new Date(grupo.ultimaAtualizacao).toLocaleDateString(
                    "pt-BR",
                  )}
                </div>
              ) : null}
            </dl>
          </Card>
        ))}
      </div>
    </div>
  );
}
