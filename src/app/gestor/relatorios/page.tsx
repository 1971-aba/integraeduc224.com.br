import Link from "next/link";
import { BarChart3, ClipboardList, FileSpreadsheet, Users } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";

const relatorios = [
  {
    href: "/gestor/relatorios/matriculas",
    title: "Resumo de Matrículas",
    description: "Totais por turma e por série na unidade",
    icon: FileSpreadsheet,
  },
  {
    href: "/gestor/relatorios/por-turma",
    title: "Alunos por Turma",
    description: "Relação nominal de matriculados em cada turma",
    icon: Users,
  },
  {
    href: "/gestor/relatorios/por-serie",
    title: "Alunos por Série",
    description: "Quantitativo consolidado por ano/série",
    icon: BarChart3,
  },
] as const;

const consultas = [
  {
    href: "/gestor/consultas/diario",
    title: "Conferir Diários",
    description: "Pendências de chamada e conteúdo na escola",
    icon: ClipboardList,
  },
  {
    href: "/gestor/consultas/frequencia",
    title: "Frequência Escolar",
    description: "Presença consolidada por turma",
    icon: BarChart3,
  },
  {
    href: "/gestor/consultas/evasao",
    title: "Evasão Escolar",
    description: "Alunos acima do limite legal de faltas",
    icon: BarChart3,
  },
] as const;

export default async function GestorRelatoriosPage() {
  await requireRole(["gestor_escolar", "admin_sme"]);

  return (
    <>
      <GestorPageHeader
        title="Relatórios e Consultas"
        description="Matrículas, frequência e acompanhamento pedagógico"
      />

      <h2 className="mb-4 text-lg font-semibold text-slate-900">Relatórios</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <h2 className="mb-4 text-lg font-semibold text-slate-900">Consultas</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {consultas.map((item) => (
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
