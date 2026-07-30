import Link from "next/link";
import { BarChart3, Download, FileClock } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";

const relatorios = [
  {
    href: "/sga/relatorios/acessos-por-perfil",
    title: "Acessos por Perfil",
    description: "Quantidade de usuários ativos e inativos por perfil de acesso",
    icon: BarChart3,
  },
  {
    href: "/sga/relatorios/log-cadastros",
    title: "Log de Cadastros",
    description: "Histórico recente de usuários criados pelo SGA",
    icon: FileClock,
  },
  {
    href: "/sga/relatorios/exportar",
    title: "Exportar Usuários",
    description: "Baixe a relação completa em CSV para planilhas",
    icon: Download,
  },
] as const;

export default async function SgaRelatoriosPage() {
  await requireRole(["tecnico_sga", "admin_sme"]);

  return (
    <>
      <GestorPageHeader
        title="Relatórios SGA"
        description="Consultas e exportações sobre os acessos da rede"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relatorios.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#E3F2FD] text-[#1E7BB8]">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
