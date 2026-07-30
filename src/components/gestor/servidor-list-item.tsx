"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { toggleServidorAtivo } from "@/actions/gestor-servidores";
import { Button } from "@/components/ui/button";
import { getRoleLabelSga } from "@/lib/sga-dashboard";
import { formatCpf } from "@/lib/utils";
import type { UserRole } from "@/types/database";

type ServidorListItemProps = {
  servidor: {
    id: string;
    nome: string;
    email: string;
    cpf: string | null;
    role: UserRole;
    ativo: boolean;
  };
};

export function ServidorListItem({ servidor }: ServidorListItemProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    const acao = servidor.ativo ? "desativar" : "reativar";
    if (!confirm(`${acao.charAt(0).toUpperCase()}${acao.slice(1)} ${servidor.nome}?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    const result = await toggleServidorAtivo(servidor.id, !servidor.ativo);

    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <li className="rounded-xl border border-slate-100 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{servidor.nome}</p>
          <p className="text-slate-600">{getRoleLabelSga(servidor.role)}</p>
          <p className="mt-1 text-xs text-slate-500">
            {servidor.email}
            {servidor.cpf ? ` • CPF ${formatCpf(servidor.cpf)}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={
              servidor.ativo
                ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
            }
          >
            {servidor.ativo ? "Ativo" : "Inativo"}
          </span>
          <Button
            type="button"
            variant="secondary"
            className="h-8 px-3 text-xs"
            disabled={loading}
            onClick={handleToggle}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : servidor.ativo ? (
              "Desativar"
            ) : (
              "Reativar"
            )}
          </Button>
        </div>
      </div>

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </li>
  );
}
