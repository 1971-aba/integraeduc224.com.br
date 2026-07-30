import { ClipboardList } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { requireRole } from "@/lib/auth";
import {
  getCoordenadorEscolaId,
  getDiarioPendenciasEscola,
} from "@/lib/coordenador-data";
import {
  formatPendenciaData,
  type DiarioPendencia,
} from "@/lib/professor-diario";
import { createClient } from "@/lib/supabase/server";

export default async function CoordenadorDiarioPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data: dataParam } = await searchParams;
  const { profile } = await requireRole(["coordenador", "admin_sme"]);
  const escolaId = getCoordenadorEscolaId(profile);
  const dataReferencia =
    dataParam ?? new Date().toISOString().slice(0, 10);

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title="Conferir Diários"
          description="Acompanhamento de chamada e conteúdo ministrado"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const supabase = await createClient();
  const pendencias = await getDiarioPendenciasEscola(
    supabase,
    escolaId,
    dataReferencia,
  );

  const pendentes = pendencias.filter((item) => item.pendente);
  const concluidas = pendencias.filter(
    (item) => item.diaLetivo && !item.pendente,
  );
  const naoLetivos = pendencias.filter((item) => !item.diaLetivo);

  return (
    <>
      <GestorPageHeader
        title="Conferir Diários"
        description="Acompanhamento de chamada e conteúdo ministrado na escola"
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
          className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-semibold text-white hover:bg-[#186399]"
        >
          Consultar
        </button>
      </form>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Pendentes" value={String(pendentes.length)} tone="warning" />
        <StatCard label="Concluídas" value={String(concluidas.length)} tone="success" />
        <StatCard label="Não letivos" value={String(naoLetivos.length)} tone="neutral" />
      </div>

      {pendencias.length === 0 ? (
        <EmptyState message="Nenhuma atribuição docente ativa nesta escola." />
      ) : (
        <div className="space-y-6">
          {pendentes.length > 0 ? (
            <PendenciasSection title="Pendências na data" items={pendentes} />
          ) : null}
          {concluidas.length > 0 ? (
            <PendenciasSection title="Diários em dia" items={concluidas} done />
          ) : null}
          {naoLetivos.length > 0 ? (
            <PendenciasSection title="Dias não letivos" items={naoLetivos} muted />
          ) : null}
          {pendentes.length === 0 && concluidas.length === 0 ? (
            <EmptyState message="Não há registros para esta data." />
          ) : null}
        </div>
      )}
    </>
  );
}

type PendenciaItem = DiarioPendencia & { professorNome?: string };

function PendenciasSection({
  title,
  items,
  done = false,
  muted = false,
}: {
  title: string;
  items: PendenciaItem[];
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
            <h3 className="font-semibold text-slate-900">
              {item.professorNome ?? "Professor"} — {item.disciplina}
            </h3>
            <p className="text-sm text-slate-600">
              {item.turma} • {item.serie} • {item.turno} •{" "}
              {formatPendenciaData(item.data)}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
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
              {done ? (
                <span className="text-xs font-medium text-green-700">
                  Completo
                </span>
              ) : null}
              {muted ? (
                <span className="text-xs text-slate-500">Sem aula nesta data</span>
              ) : null}
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
