import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import type { ProfessorTurmaResumo } from "@/lib/professor-dashboard";

type ProfessorTurmasGridProps = {
  title: string;
  description: string;
  turmas: ProfessorTurmaResumo[];
  hrefForTurma: (atribuicaoId: string) => string;
  actionLabel?: string;
};

export function ProfessorTurmasGrid({
  title,
  description,
  turmas,
  hrefForTurma,
  actionLabel = "Abrir",
}: ProfessorTurmasGridProps) {
  return (
    <>
      <GestorPageHeader title={title} description={description} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {turmas.map((turma) => (
          <Link
            key={turma.id}
            href={hrefForTurma(turma.id)}
            className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E3F2FD]">
                <BookOpen className="h-5 w-5 text-[#1E7BB8]" />
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#1E7BB8]" />
            </div>
            <h3 className="font-semibold text-slate-900">{turma.disciplina}</h3>
            <p className="mt-1 text-sm text-slate-600">
              {turma.turma} — {turma.serie} • {turma.turno}
            </p>
            <p className="mt-4 text-sm font-medium text-[#1E7BB8]">{actionLabel}</p>
          </Link>
        ))}

        {turmas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center sm:col-span-2 lg:col-span-3">
            <p className="font-medium text-slate-800">Sem turmas vinculadas</p>
            <p className="mt-2 text-sm text-slate-600">
              Aguarde a coordenação vincular você às disciplinas e turmas.
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}
