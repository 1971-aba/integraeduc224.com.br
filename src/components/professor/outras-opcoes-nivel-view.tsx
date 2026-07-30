import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { NivelEnsinoPlano } from "@/lib/professor-planos";
import { tituloNivelPlano } from "@/lib/professor-planos";

type OutrasOpcoesNivelViewProps = {
  nivel: NivelEnsinoPlano;
};

export function OutrasOpcoesNivelView({ nivel }: OutrasOpcoesNivelViewProps) {
  const titulo = tituloNivelPlano(nivel);

  const opcoes = [
    {
      href: `/professor/planos/${nivel}`,
      title: "Meus Planos",
      description: `Lista de planos de aula produzidos para o ${titulo.toLowerCase()}.`,
      icon: FileText,
    },
    {
      href: `/professor/planos/novo?nivel=${nivel}`,
      title: "Gerar Plano com IA",
      description: `Crie um novo plano de aula para séries do ${titulo.toLowerCase()}.`,
      icon: Sparkles,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {opcoes.map((opcao) => (
        <Link key={opcao.href} href={opcao.href}>
          <Card className="h-full transition-shadow hover:shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
              <opcao.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <CardTitle>{opcao.title}</CardTitle>
            <CardDescription className="mt-2">
              {opcao.description}
            </CardDescription>
          </Card>
        </Link>
      ))}
    </div>
  );
}
