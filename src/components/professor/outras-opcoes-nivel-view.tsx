import Link from "next/link";
import {
  ClipboardCheck,
  FileText,
  Lightbulb,
  Package,
  Sparkles,
  Sprout,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { NivelEnsinoPlano, SecaoPlano } from "@/lib/professor-planos";
import {
  SECOES_PLANO,
  secoesDoNivel,
  tituloNivelPlano,
} from "@/lib/professor-planos";

type OutrasOpcoesNivelViewProps = {
  nivel: NivelEnsinoPlano;
};

const ICONE_SECAO: Record<SecaoPlano, LucideIcon> = {
  metodologia: Lightbulb,
  recursos: Package,
  avaliacao: ClipboardCheck,
  experiencias: Sprout,
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
    ...secoesDoNivel(nivel).map((secao) => ({
      href: `/professor/planos/outras-opcoes/${nivel}/${SECOES_PLANO[secao].slug}`,
      title: SECOES_PLANO[secao].titulo,
      description: SECOES_PLANO[secao].descricao,
      icon: ICONE_SECAO[secao],
    })),
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
