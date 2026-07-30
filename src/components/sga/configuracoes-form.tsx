"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  salvarPermissoesSga,
  salvarPoliticaSenha,
} from "@/actions/sga-configuracoes";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { ConfiguracaoRede } from "@/lib/gestor-modulos-types";

type SgaConfiguracoesFormProps = {
  config: ConfiguracaoRede;
};

export function SgaConfiguracoesForm({ config }: SgaConfiguracoesFormProps) {
  const router = useRouter();
  const [pendingSenha, startSenha] = useTransition();
  const [pendingPerm, startPerm] = useTransition();
  const [msgSenha, setMsgSenha] = useState<string | null>(null);
  const [msgPerm, setMsgPerm] = useState<string | null>(null);
  const [errSenha, setErrSenha] = useState<string | null>(null);
  const [errPerm, setErrPerm] = useState<string | null>(null);

  function handleSenha(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrSenha(null);
    setMsgSenha(null);

    startSenha(async () => {
      const result = await salvarPoliticaSenha(new FormData(event.currentTarget));
      if (result.error) setErrSenha(result.error);
      else {
        setMsgSenha("Política de senhas salva.");
        router.refresh();
      }
    });
  }

  function handlePerm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrPerm(null);
    setMsgPerm(null);

    startPerm(async () => {
      const result = await salvarPermissoesSga(new FormData(event.currentTarget));
      if (result.error) setErrPerm(result.error);
      else {
        setMsgPerm("Permissões do SGA salvas.");
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardTitle>Política de senhas</CardTitle>
        <CardDescription>
          Regras aplicadas ao cadastrar ou alterar senhas de usuários
        </CardDescription>

        <form onSubmit={handleSenha} className="mt-6 space-y-4">
          {errSenha ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errSenha}
            </p>
          ) : null}
          {msgSenha ? (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {msgSenha}
            </p>
          ) : null}

          <div>
            <label htmlFor="minLength" className="mb-1 block text-sm font-medium">
              Tamanho mínimo
            </label>
            <input
              id="minLength"
              name="minLength"
              type="number"
              min={6}
              max={32}
              defaultValue={config.politicaSenha.minLength}
              className="h-10 w-32 rounded-md border border-slate-300 px-3 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="exigeMaiuscula"
              defaultChecked={config.politicaSenha.exigeMaiuscula}
            />
            Exigir letra maiúscula
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="exigeNumero"
              defaultChecked={config.politicaSenha.exigeNumero}
            />
            Exigir número
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="exigeEspecial"
              defaultChecked={config.politicaSenha.exigeEspecial}
            />
            Exigir caractere especial
          </label>

          <button
            type="submit"
            disabled={pendingSenha}
            className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399] disabled:opacity-60"
          >
            {pendingSenha ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar política"
            )}
          </button>
        </form>
      </Card>

      <Card>
        <CardTitle>Permissões do SGA</CardTitle>
        <CardDescription>
          Controle o que técnicos SGA podem fazer no painel de acessos
        </CardDescription>

        <form onSubmit={handlePerm} className="mt-6 space-y-4">
          {errPerm ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errPerm}
            </p>
          ) : null}
          {msgPerm ? (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {msgPerm}
            </p>
          ) : null}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="podeCriarGestor"
              defaultChecked={config.permissoesSga.podeCriarGestor}
            />
            Permitir cadastro de gestores escolares
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="podeCriarAdmin"
              defaultChecked={config.permissoesSga.podeCriarAdmin}
            />
            Permitir cadastro de administradores SME
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="podeDesativarUsuario"
              defaultChecked={config.permissoesSga.podeDesativarUsuario}
            />
            Permitir desativar usuários
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="exigeEmailInstitucional"
              defaultChecked={config.permissoesSga.exigeEmailInstitucional}
            />
            Exigir e-mail institucional (@educacao ou domínio da rede)
          </label>

          <button
            type="submit"
            disabled={pendingPerm}
            className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399] disabled:opacity-60"
          >
            {pendingPerm ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar permissões"
            )}
          </button>
        </form>
      </Card>
    </div>
  );
}
