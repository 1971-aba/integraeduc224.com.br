import Link from "next/link";
import { CheckCircle2, ClipboardList } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { requireRole } from "@/lib/auth";
import {
  formatPendenciaData,
  getDiarioPendencias,
} from "@/lib/professor-diario";

export default async function PendenciasDiarioPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data: dataParam } = await searchParams;
  const { profile } = await requireRole(["professor"]);
  const dataReferencia =
    dataParam ?? new Date().toISOString().slice(0, 10);

  const pendencias = await getDiarioPendencias(profile.id, dataReferencia);
  const pendentes = pendencias.filter((item) => item.pendente);
  const concluidas = pendencias.filter(
    (item) => item.diaLetivo && !item.pendente,
  );
  const naoLetivos = pendencias.filter((item) => !item.diaLetivo);

  return (
    <>
      <GestorPageHeader
        title="Pendências do Diário"
        description="Chamada e conteúdo ministrado por turma e data"
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
        <StatCard
          label="Pendentes"
          value={String(pendentes.length)}
          tone="warning"
        />
        <StatCard
          label="Concluídas"
          value={String(concluidas.length)}
          tone="success"
        />
        <StatCard
          label="Não letivos"
          value={String(naoLetivos.length)}
          tone="neutral"
        />
      </div>

      {pendencias.length === 0 ? (
        <EmptyState message="Nenhuma turma vinculada ao seu perfil." />
      ) : (
        <div className="space-y-6">
          {pendentes.length > 0 ? (
            <PendenciasSection title="Ações pendentes hoje" items={pendentes} />
          ) : null}

          {concluidas.length > 0 ? (
            <PendenciasSection title="Diário em dia" items={concluidas} done />
          ) : null}

          {naoLetivos.length > 0 ? (
            <PendenciasSection
              title="Dias não letivos"
              items={naoLetivos}
              muted
            />
          ) : null}

          {pendentes.length === 0 && concluidas.length === 0 ? (
            <EmptyState message="Não há registros para esta data." />
          ) : null}
        </div>
      )}
    </>
  );
}

function PendenciasSection({
  title,
  items,
  done = false,
  muted = false,
}: {
  title: string;
  items: Awaited<ReturnType<typeof getDiarioPendencias>>;
  done?: boolean;
  muted?: boolean;
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
            className={
              muted
                ? "rounded-lg border border-slate-200 bg-slate-50 px-4 py-4"
                : "rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm"
            }
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {item.disciplina} — {item.turma}
                </h3>
                <p className="text-sm text-slate-600">
                  {item.serie} • {item.turno} •{" "}
                  {formatPendenciaData(item.data)}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge
                    ok={item.chamadaRegistrada}
                    label="Chamada"
                    muted={muted}
                  />
                  <StatusBadge
                    ok={item.conteudoRegistrado}
                    label="Conteúdo"
                    muted={muted}
                  />
                </div>
              </div>

              {!muted ? (
                <div className="flex flex-wrap gap-2">
                  {!item.chamadaRegistrada ? (
                    <ActionLink
                      href={`/professor/turma/${item.atribuicaoId}/chamada?data=${item.data}`}
                    >
                      Registrar chamada
                    </ActionLink>
                  ) : null}
                  {!item.conteudoRegistrado ? (
                    <ActionLink
                      href={`/professor/turma/${item.atribuicaoId}/conteudo?data=${item.data}`}
                      secondary
                    >
                      Registrar conteúdo
                    </ActionLink>
                  ) : null}
                  {done ? (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Completo
                    </span>
                  ) : null}
                </div>
              ) : (
                <span className="text-sm text-slate-500">
                  Sem aula nesta data
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function StatusBadge({
  ok,
  label,
  muted,
}: {
  ok: boolean;
  label: string;
  muted?: boolean;
}) {
  if (muted) {
    return (
      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-600">
        {label}: —
      </span>
    );
  }

  return (
    <span
      className={
        ok
          ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
          : "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800"
      }
    >
      {label}: {ok ? "OK" : "Pendente"}
    </span>
  );
}

function ActionLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        secondary
          ? "inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          : "inline-flex h-9 items-center rounded-md bg-[#1E7BB8] px-3 text-sm font-medium text-white hover:bg-[#186399]"
      }
    >
      {children}
    </Link>
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
      <ClipboardList className="mx-auto mb-3 h-8 w-8 text-slate-400" />
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}
