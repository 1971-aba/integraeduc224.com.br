import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  ClipboardList,
  FileText,
  Users,
} from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { EscolaResumo } from "@/lib/coordenador-data";

const links = [
  {
    href: "/coordenador/alunos",
    label: "Alunos",
    description: "Relação de matriculados na escola",
    icon: Users,
  },
  {
    href: "/coordenador/professores",
    label: "Professores",
    description: "Corpo docente e atribuições",
    icon: BookOpen,
  },
  {
    href: "/coordenador/diario",
    label: "Conferir Diários",
    description: "Chamada e conteúdo por turma",
    icon: ClipboardList,
  },
  {
    href: "/coordenador/planos",
    label: "Planos de Aula",
    description: "Planos produzidos pelos professores",
    icon: FileText,
  },
  {
    href: "/coordenador/frequencia",
    label: "Frequência",
    description: "Presença consolidada por turma",
    icon: BarChart3,
  },
  {
    href: "/coordenador/evasao",
    label: "Evasão",
    description: "Alunos acima do limite de faltas",
    icon: AlertTriangle,
  },
  {
    href: "/coordenador/boletins",
    label: "Boletins",
    description: "Notas por turma e bimestre",
    icon: FileText,
  },
] as const;

type CoordenadorQuickLinksProps = {
  resumo?: EscolaResumo | null;
};

export function CoordenadorQuickLinks({ resumo }: CoordenadorQuickLinksProps) {
  return (
    <div className="mt-8 space-y-6">
      {resumo ? (
        <>
          {resumo.pendenciasHoje > 0 ? (
            <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-medium text-amber-900">
                {resumo.pendenciasHoje} pendência(s) no diário eletrônico hoje na
                escola.
              </p>
              <Link
                href="/coordenador/diario"
                className="mt-2 inline-flex text-sm font-semibold text-[#1E7BB8] hover:underline"
              >
                Conferir diários →
              </Link>
            </section>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Alunos matriculados" value={resumo.alunosMatriculados} />
          <StatCard label="Professores" value={resumo.professores} />
          <StatCard label="Turmas" value={resumo.turmas} />
          <StatCard label="Atribuições" value={resumo.atribuicoes} />
          <StatCard
            label="Pendências hoje"
            value={resumo.pendenciasHoje}
            highlight={resumo.pendenciasHoje > 0}
          />
          </div>
        </>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#E3F2FD] text-[#1E7BB8]">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <CardTitle>{item.label}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-lg border border-amber-200 bg-[#FFFDE7] px-4 py-4"
          : "rounded-lg border border-slate-200 bg-white px-4 py-4"
      }
    >
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}
