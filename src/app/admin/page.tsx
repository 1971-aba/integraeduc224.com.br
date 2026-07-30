import { Building2, CalendarDays, BarChart3, School } from "lucide-react";
import Link from "next/link";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getAlunosEvasao } from "@/lib/bi";
import { EVASAO_LIMITE_PERCENTUAL } from "@/lib/bi-types";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const { profile } = await requireRole(["admin_sme"]);
  const supabase = await createClient();

  const [{ count: escolasCount }, { count: turmasCount }, { data: anoAtivo }, alunosEvasao] =
    await Promise.all([
      supabase
        .from("escolas")
        .select("*", { count: "exact", head: true })
        .eq("ativa", true),
      supabase.from("turmas").select("*", { count: "exact", head: true }),
      supabase
        .from("anos_letivos")
        .select("ano")
        .eq("ativo", true)
        .maybeSingle(),
      getAlunosEvasao(EVASAO_LIMITE_PERCENTUAL),
    ]);

  return (
    <DashboardShell
      profile={profile}
      title="Painel SME"
      description="Visão consolidada da rede municipal de ensino"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<School className="h-5 w-5 text-blue-700" />}
          title="Escolas ativas"
          value={escolasCount ?? 0}
          description="Unidades escolares cadastradas na rede"
        />
        <StatCard
          icon={<Building2 className="h-5 w-5 text-blue-700" />}
          title="Turmas"
          value={turmasCount ?? 0}
          description="Turmas vinculadas ao ano letivo"
        />
        <StatCard
          icon={<CalendarDays className="h-5 w-5 text-blue-700" />}
          title="Ano letivo"
          value={anoAtivo?.ano ?? "—"}
          description="Calendário oficial em vigor"
        />
        <Link href="/admin/bi">
          <Card className="h-full transition-shadow hover:shadow-md">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-600" />
            </div>
            <CardTitle>Alertas de evasão</CardTitle>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {alunosEvasao.length}
            </p>
            <CardDescription>
              Alunos com {EVASAO_LIMITE_PERCENTUAL}%+ de faltas — ver BI
            </CardDescription>
          </Card>
        </Link>
      </div>
    </DashboardShell>
  );
}

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  description: string;
}) {
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">{icon}</div>
      <CardTitle>{title}</CardTitle>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <CardDescription>{description}</CardDescription>
    </Card>
  );
}
