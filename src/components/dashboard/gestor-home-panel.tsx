import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  GraduationCap,
  UserCheck,
  Users,
} from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { EscolaResumo } from "@/lib/coordenador-data";

const links = [
  {
    href: "/gestor/alunos",
    label: "Alunos",
    description: "Cadastro, matrícula e transferências",
    icon: Users,
  },
  {
    href: "/gestor/turmas",
    label: "Turmas",
    description: "Turmas e disciplinas do ano letivo",
    icon: GraduationCap,
  },
  {
    href: "/gestor/entrada-alunos",
    label: "Entrada de Alunos",
    description: "Controle de chegada diária",
    icon: UserCheck,
  },
  {
    href: "/gestor/consultas/diario",
    label: "Conferir Diários",
    description: "Chamada e conteúdo por turma",
    icon: ClipboardList,
  },
  {
    href: "/gestor/corrigir-matriculas",
    label: "Corrigir Matrículas",
    description: "Regularização de matrículas 2026",
    icon: AlertTriangle,
  },
  {
    href: "/gestor/relatorios",
    label: "Relatórios",
    description: "Matrículas, turmas e séries",
    icon: BarChart3,
  },
] as const;

type GestorHomePanelProps = {
  resumo?: EscolaResumo | null;
};

export function GestorHomePanel({ resumo }: GestorHomePanelProps) {
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
                href="/gestor/consultas/diario"
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
