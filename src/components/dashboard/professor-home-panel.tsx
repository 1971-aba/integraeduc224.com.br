import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import type { ProfessorTurmaResumo } from "@/lib/professor-dashboard";

type ProfessorHomePanelProps = {
  turmas: ProfessorTurmaResumo[];
  planosTotal: number;
  pendenciasDiario: number;
  tarefasAbertas: number;
};

export function ProfessorHomePanel({
  turmas,
  planosTotal,
  pendenciasDiario,
  tarefasAbertas,
}: ProfessorHomePanelProps) {
  const diarioStatus =
    turmas.length === 0
      ? "Aguardando"
      : pendenciasDiario > 0
        ? `${pendenciasDiario} pendente(s)`
        : "Em dia";
  return (
    <div className="mt-10 space-y-8">
      {pendenciasDiario > 0 ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-900">
            Você tem {pendenciasDiario} pendência(s) no diário eletrônico hoje.
          </p>
          <Link
            href="/professor/diario/pendencias"
            className="mt-2 inline-flex text-sm font-semibold text-[#1E7BB8] hover:underline"
          >
            Resolver pendências →
          </Link>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ResumoCard
          icon={<GraduationCap className="h-5 w-5 text-[#1E7BB8]" />}
          label="Turmas vinculadas"
          value={String(turmas.length)}
        />
        <ResumoCard
          icon={<FileText className="h-5 w-5 text-[#1E7BB8]" />}
          label="Planos de aula"
          value={String(planosTotal)}
        />
        <ResumoCard
          icon={<ClipboardList className="h-5 w-5 text-[#1E7BB8]" />}
          label="Diário hoje"
          value={diarioStatus}
          highlight={pendenciasDiario > 0}
        />
        <ResumoCard
          icon={<BookOpen className="h-5 w-5 text-[#1E7BB8]" />}
          label="Tarefas em aberto"
          value={String(tarefasAbertas)}
        />
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Minhas turmas e disciplinas
            </h2>
            <p className="text-sm text-slate-600">
              Acesso rápido à chamada, notas, conteúdo e planos
            </p>
          </div>
          <Link
            href="/professor/planos/novo"
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#4097B1] px-4 text-sm font-semibold text-white hover:bg-[#36899f]"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Gerar plano com IA
          </Link>
        </div>

        {turmas.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {turmas.map((turma) => (
              <article
                key={turma.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E3F2FD]">
                    <BookOpen className="h-5 w-5 text-[#1E7BB8]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {turma.disciplina}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {turma.turma} — {turma.serie} • {turma.turno}
                    </p>
                    {turma.anoLetivo ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Ano letivo {turma.anoLetivo}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
          <TurmaLink href="/professor/diario/pendencias" variant="secondary">
            Pendências
          </TurmaLink>
          <TurmaLink href="/professor/conteudo" variant="secondary">
            Conteúdo
          </TurmaLink>
          <TurmaLink
            href={`/professor/consultas/frequencia?turma=${turma.id}`}
            variant="secondary"
          >
            Frequência
          </TurmaLink>
          <TurmaLink href={`/professor/turma/${turma.id}/chamada`}>
            Chamada
          </TurmaLink>
                  <TurmaLink href={`/professor/turma/${turma.id}/notas`}>
                    Notas
                  </TurmaLink>
                  <TurmaLink href={`/professor/turma/${turma.id}/conteudo`}>
                    Conteúdo
                  </TurmaLink>
                  <TurmaLink href="/professor/planos" variant="secondary">
                    Planos
                  </TurmaLink>
                  <TurmaLink href="/professor/tarefas" variant="secondary">
                    Tarefas
                  </TurmaLink>
                  <TurmaLink
                    href={`/professor/desempenho?turma=${turma.id}`}
                    variant="secondary"
                  >
                    Desempenho
                  </TurmaLink>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <p className="font-medium text-slate-800">Nenhuma turma vinculada</p>
            <p className="mt-2 text-sm text-slate-600">
              Aguarde a coordenação ou o gestor escolar realizar a atribuição
              docente em Atribuições.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function ResumoCard({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-4 ${
        highlight
          ? "border-amber-300 bg-amber-50"
          : "border-[#BBDEFB] bg-[#E3F2FD]/40"
      }`}
    >
      <div className="mb-2">{icon}</div>
      <p
        className={`text-2xl font-bold ${
          highlight ? "text-amber-900" : "text-[#0D47A1]"
        }`}
      >
        {value}
      </p>
      <p className={`text-sm ${highlight ? "text-amber-800" : "text-[#1565C0]"}`}>
        {label}
      </p>
    </div>
  );
}

function TurmaLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={
        variant === "primary"
          ? "inline-flex h-8 items-center rounded-md bg-[#1E7BB8] px-3 text-xs font-medium text-white hover:bg-[#186399]"
          : "inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
      }
    >
      {children}
    </Link>
  );
}
