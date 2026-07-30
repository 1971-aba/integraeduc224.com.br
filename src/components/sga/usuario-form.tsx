"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";

import {
  createSgaUsuario,
  updateSgaUsuario,
  type SgaUsuarioInput,
} from "@/actions/sga-usuarios";
import { roleOptions } from "@/lib/sga-dashboard";
import type { Profile, UserRole } from "@/types/database";

type EscolaOption = { id: string; nome: string };

type UsuarioFormProps = {
  mode: "create" | "edit";
  escolas: EscolaOption[];
  usuario?: Profile;
  adminAvailable: boolean;
};

const ROLES_COM_ESCOLA: UserRole[] = [
  "gestor_escolar",
  "coordenador",
  "professor",
];

function generatePassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let result = "";
  for (let i = 0; i < 12; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function formatCpfInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function UsuarioForm({
  mode,
  escolas,
  usuario,
  adminAvailable,
}: UsuarioFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>(usuario?.role ?? "professor");
  const [cpf, setCpf] = useState(
    usuario?.cpf ? formatCpfInput(usuario.cpf) : "",
  );
  const [senha, setSenha] = useState(mode === "create" ? generatePassword() : "");

  const precisaEscola = ROLES_COM_ESCOLA.includes(role);

  function handleGeneratePassword() {
    setSenha(generatePassword());
    setShowPassword(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const input: SgaUsuarioInput = {
      nome: String(formData.get("nome") ?? ""),
      email: String(formData.get("email") ?? ""),
      cpf,
      senha: senha || String(formData.get("senha") ?? ""),
      role,
      escolaId: precisaEscola ? String(formData.get("escola_id") ?? "") : null,
      ativo: formData.get("ativo") === "on",
    };

    startTransition(async () => {
      if (mode === "create") {
        const result = await createSgaUsuario(input);
        if (result?.error) setError(result.error);
        return;
      }

      if (!usuario) return;

      const result = await updateSgaUsuario(usuario.id, {
        ...input,
        senha: input.senha || undefined,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      setSuccess("Usuário atualizado com sucesso.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {!adminAvailable ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Cadastro indisponível no momento</p>
          <p className="mt-1">
            Você está no modo demo local. Saia e entre novamente com login real
            do Supabase (SGA — Gestão de Acessos) para cadastrar usuários.
          </p>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome completo" className="sm:col-span-2">
          <input
            name="nome"
            required
            defaultValue={usuario?.nome ?? ""}
            className={inputClass}
            placeholder="Nome do usuário"
          />
        </Field>

        <Field label="CPF (login)">
          <input
            name="cpf"
            required
            value={cpf}
            onChange={(event) => setCpf(formatCpfInput(event.target.value))}
            className={inputClass}
            placeholder="000.000.000-00"
          />
        </Field>

        <Field label="E-mail institucional">
          <input
            name="email"
            type="email"
            required
            defaultValue={usuario?.email ?? ""}
            className={inputClass}
            placeholder="usuario@sme.gov.br"
          />
        </Field>

        <Field label="Perfil de acesso">
          <select
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className={inputClass}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        {precisaEscola ? (
          <Field label="Escola vinculada">
            <select
              name="escola_id"
              required
              defaultValue={usuario?.escola_id ?? ""}
              className={inputClass}
            >
              <option value="" disabled>
                Selecione a escola
              </option>
              {escolas.map((escola) => (
                <option key={escola.id} value={escola.id}>
                  {escola.nome}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <div className="hidden sm:block" />
        )}

        <Field
          label={mode === "create" ? "Senha inicial" : "Nova senha (opcional)"}
          className="sm:col-span-2"
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                name="senha"
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required={mode === "create"}
                minLength={8}
                className={`${inputClass} pr-10`}
                placeholder={
                  mode === "create"
                    ? "Senha para primeiro acesso"
                    : "Deixe em branco para manter a atual"
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="inline-flex h-10 shrink-0 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Gerar
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Mínimo de 8 caracteres. Informe ao usuário de forma segura.
          </p>
        </Field>

        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="ativo"
            name="ativo"
            type="checkbox"
            defaultChecked={usuario?.ativo ?? true}
            className="h-4 w-4 rounded border-slate-300 text-[#1E7BB8] focus:ring-[#1E7BB8]"
          />
          <label htmlFor="ativo" className="text-sm text-slate-700">
            Usuário ativo (pode acessar o sistema)
          </label>
        </div>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending || !adminAvailable}
          className="inline-flex h-10 items-center rounded-md bg-[#4097B1] px-5 text-sm font-semibold text-white hover:bg-[#36899f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : mode === "create" ? (
            "Cadastrar usuário"
          ) : (
            "Salvar alterações"
          )}
        </button>
        <Link
          href="/sga/usuarios"
          className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-inner placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4097B1]/40";
