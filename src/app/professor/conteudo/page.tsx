import Link from "next/link";
import { BookOpenCheck, FileText } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { requireRole } from "@/lib/auth";
import {
  formatPendenciaData,
  getDiarioPendencias,
} from "@/lib/professor-diario";

export default async function ProfessorConteudoPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data: dataParam } = await searchParams;
  const { profile } = await requireRole(["professor"]);
  const dataReferencia =
    dataParam ?? new Date().toISOString().slice(0, 10);

  const pendencias = await getDiarioPendencias(profile.id, dataReferencia);
  const comConteudo = pendencias.filter(
    (item) => item.diaLetivo && item.conteudoRegistrado,
  );
  const semConteudo = pendencias.filter(
    (item) => item.diaLetivo && !item.conteudoRegistrado,
  );
  const naoLetivos = pendencias.filter((item) => !item.diaLetivo);

  return (
    <>
      <GestorPageHeader
        title="Conteúdo Ministrado"
        description="Registro diário do conteúdo lecionado por turma"
      />

      <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label
            htmlFor="data"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Data de referência
          </label>
          <input
            id="data"
            name="data"
            type="date"
            defaultValue={dataReferencia}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-[#4097B1] px-4 text-sm font-semibold text-white hover:bg-[#36899f]"
        >
          Consultar
        </button>
      </form>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Registrados" value={String(comConteudo.length)} tone="success" />
        <StatCard label="Pendentes" value={String(semConteudo.length)} tone="warning" />
        <StatCard label="Não letivos" value={String(naoLetivos.length)} tone="neutral" />
      </div>

      {pendencias.length === 0 ? (
        <EmptyState message="Nenhuma turma vinculada ao seu perfil." />
      ) : (
        <div className="space-y-6">
          {semConteudo.length > 0 ? (
            <ConteudoSection title="Conteúdo pendente" items={semConteudo} />
          ) : null}
          {comConteudo.length > 0 ? (
            <ConteudoSection title="Conteúdo registrado" items={comConteudo} done />
          ) : null}
          {semConteudo.length === 0 && comConteudo.length === 0 ? (
            <EmptyState message="Não há aulas previstas para esta data." />
          ) : null}
        </div>
      )}
    </>
  );
}

function ConteudoSection({
  title,
  items,
  done = false,
}: {
  title: string;
  items: Awaited<ReturnType<typeof getDiarioPendencias>>;
  done?: boolean;
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.atribuicaoId}
            className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {item.disciplina} — {item.turma}
                </h3>
                <p className="text-sm text-slate-600">
                  {item.serie} • {item.turno} • {formatPendenciaData(item.data)}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Chamada: {item.chamadaRegistrada ? "registrada" : "pendente"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {done ? (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700">
                    <BookOpenCheck className="h-4 w-4" />
                    Conteúdo OK
                  </span>
                ) : (
                  <Link
                    href={`/professor/turma/${item.atribuicaoId}/conteudo?data=${item.data}`}
                    className="inline-flex h-9 items-center rounded-md bg-[#1E7BB8] px-3 text-sm font-medium text-white hover:bg-[#186399]"
                  >
                    Registrar conteúdo
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "warning" | "success" | "neutral";
}) {
  const styles = {
    warning: "border-amber-200 bg-[#FFFDE7] text-amber-900",
    success: "border-green-200 bg-green-50 text-green-900",
    neutral: "border-slate-200 bg-slate-50 text-slate-800",
  };

  return (
    <div className={`rounded-lg border px-4 py-4 ${styles[tone]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <FileText className="mx-auto mb-3 h-8 w-8 text-slate-400" />
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}
