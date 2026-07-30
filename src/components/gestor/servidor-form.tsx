"use client";

import { Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";

import { createServidorEscola, type ServidorInput } from "@/actions/gestor-servidores";
import type { UserRole } from "@/types/database";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "coordenador", label: "Coordenador Pedagógico" },
  { value: "professor", label: "Professor" },
];

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
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

export function ServidorForm({ fixedRole }: { fixedRole?: UserRole } = {}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState(generatePassword());

  function handleGeneratePassword() {
    setSenha(generatePassword());
    setShowPassword(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const input: ServidorInput = {
      nome: String(formData.get("nome") ?? ""),
      email: String(formData.get("email") ?? ""),
      cpf,
      senha,
      role: (fixedRole ??
        String(formData.get("role") ?? "professor")) as UserRole,
      ativo: formData.get("ativo") === "on",
    };

    startTransition(async () => {
      const result = await createServidorEscola(input);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
    >
      <h3 className="text-base font-semibold text-slate-900">
        {fixedRole === "professor"
          ? "Novo professor"
          : "Novo servidor da escola"}
      </h3>
      <p className="text-sm text-slate-600">
        {fixedRole === "professor"
          ? "Cadastre professores vinculados à unidade escolar."
          : "Cadastre coordenadores e professores vinculados à unidade escolar."}
      </p>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="nome" className="mb-1 block text-sm font-medium">
            Nome completo
          </label>
          <input
            id="nome"
            name="nome"
            required
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="cpf" className="mb-1 block text-sm font-medium">
            CPF
          </label>
          <input
            id="cpf"
            name="cpf"
            required
            value={cpf}
            onChange={(event) => setCpf(formatCpfInput(event.target.value))}
            placeholder="000.000.000-00"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            E-mail institucional
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>

        {!fixedRole ? (
          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium">
              Perfil
            </label>
            <select
              id="role"
              name="role"
              defaultValue="professor"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <label htmlFor="senha" className="mb-1 block text-sm font-medium">
            Senha inicial
          </label>
          <div className="flex gap-2">
            <input
              id="senha"
              name="senha"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              className="h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="inline-flex h-10 items-center rounded-md border border-slate-300 px-3 text-sm"
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              Gerar
            </button>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="ativo" defaultChecked className="rounded" />
        Usuário ativo
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399] disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : fixedRole === "professor" ? (
          "Cadastrar professor"
        ) : (
          "Cadastrar servidor"
        )}
      </button>
    </form>
  );
}
