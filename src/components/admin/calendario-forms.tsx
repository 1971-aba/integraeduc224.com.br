"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ativarAnoLetivo,
  criarAnoLetivo,
  criarBimestre,
  criarEventoCalendario,
} from "@/actions/admin-sme";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type AnoOption = { id: string; label: string };

type CalendarioFormsProps = {
  anosLetivos: AnoOption[];
  anoAtivoId?: string;
};

export function CalendarioForms({ anosLetivos, anoAtivoId }: CalendarioFormsProps) {
  return (
    <div className="mb-8 grid gap-6 lg:grid-cols-3">
      <AnoLetivoForm />
      <BimestreForm anosLetivos={anosLetivos} defaultAnoId={anoAtivoId} />
      <EventoForm anosLetivos={anosLetivos} defaultAnoId={anoAtivoId} />
    </div>
  );
}

export function AtivarAnoButton({ anoLetivoId }: { anoLetivoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleActivate() {
    setLoading(true);
    await ativarAnoLetivo(anoLetivoId);
    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={loading}
      className="h-8 px-2.5 text-xs"
      onClick={handleActivate}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
      ) : (
        "Definir como ativo"
      )}
    </Button>
  );
}

function AnoLetivoForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await criarAnoLetivo(formData);
    if (result.error) setError(result.error);
    else router.refresh();
    setLoading(false);
  }

  const anoAtual = new Date().getFullYear();

  return (
    <Card>
      <CardTitle>Novo ano letivo</CardTitle>
      <CardDescription>Cadastre um calendário escolar</CardDescription>
      <form action={handleSubmit} className="mt-4 space-y-3">
        <input
          name="ano"
          type="number"
          required
          min={2000}
          max={2100}
          defaultValue={anoAtual}
          className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="ativo" defaultChecked className="h-4 w-4" />
          Definir como ano ativo
        </label>
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        ) : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar ano"}
        </Button>
      </form>
    </Card>
  );
}

function BimestreForm({
  anosLetivos,
  defaultAnoId,
}: {
  anosLetivos: AnoOption[];
  defaultAnoId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await criarBimestre(formData);
    if (result.error) setError(result.error);
    else router.refresh();
    setLoading(false);
  }

  return (
    <Card>
      <CardTitle>Novo bimestre</CardTitle>
      <CardDescription>Períodos do ano letivo</CardDescription>
      <form action={handleSubmit} className="mt-4 space-y-3">
        <select
          name="ano_letivo_id"
          required
          defaultValue={defaultAnoId ?? ""}
          className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
        >
          <option value="" disabled>
            Ano letivo...
          </option>
          {anosLetivos.map((ano) => (
            <option key={ano.id} value={ano.id}>
              {ano.label}
            </option>
          ))}
        </select>
        <select
          name="numero"
          required
          defaultValue=""
          className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
        >
          <option value="" disabled>
            Bimestre...
          </option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n}º bimestre
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            name="data_inicio"
            type="date"
            required
            className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          />
          <input
            name="data_fim"
            type="date"
            required
            className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          />
        </div>
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        ) : null}
        <Button type="submit" disabled={loading || anosLetivos.length === 0} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar bimestre"}
        </Button>
      </form>
    </Card>
  );
}

function EventoForm({
  anosLetivos,
  defaultAnoId,
}: {
  anosLetivos: AnoOption[];
  defaultAnoId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await criarEventoCalendario(formData);
    if (result.error) setError(result.error);
    else router.refresh();
    setLoading(false);
  }

  return (
    <Card>
      <CardTitle>Novo evento</CardTitle>
      <CardDescription>Feriados, recessos e datas especiais</CardDescription>
      <form action={handleSubmit} className="mt-4 space-y-3">
        <select
          name="ano_letivo_id"
          required
          defaultValue={defaultAnoId ?? ""}
          className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
        >
          <option value="" disabled>
            Ano letivo...
          </option>
          {anosLetivos.map((ano) => (
            <option key={ano.id} value={ano.id}>
              {ano.label}
            </option>
          ))}
        </select>
        <input
          name="titulo"
          required
          placeholder="Título do evento"
          className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
        />
        <select
          name="tipo"
          defaultValue="feriado"
          className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
        >
          <option value="feriado">Feriado</option>
          <option value="recesso">Recesso</option>
          <option value="evento">Evento escolar</option>
          <option value="formacao">Formação</option>
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            name="data_inicio"
            type="date"
            required
            className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          />
          <input
            name="data_fim"
            type="date"
            className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          />
        </div>
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        ) : null}
        <Button type="submit" disabled={loading || anosLetivos.length === 0} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar evento"}
        </Button>
      </form>
    </Card>
  );
}
