import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const opcoes = [
  {
    href: "/professor/planos",
    title: "Meus Planos",
    description: "Lista completa de todos os planos de aula produzidos.",
    icon: FileText,
  },
  {
    href: "/professor/planos/novo",
    title: "Gerar Plano com IA",
    description: "Crie um novo plano alinhado à BNCC com assistente inteligente.",
    icon: Sparkles,
  },
];

export default function PlanosOutrasOpcoesPage() {
  return (
    <>
      <GestorPageHeader
        title="Outras opções"
        description="Atalhos complementares para gestão dos seus planos de aula"
      />

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
    </>
  );
}
