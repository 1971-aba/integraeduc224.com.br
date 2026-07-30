"use client";

import Image from "next/image";
import { ChevronDown, Eye, EyeOff, KeyRound, Loader2, UserRound } from "lucide-react";
import { useState } from "react";

import { login } from "@/actions/auth";
import type { AnoLetivoOption } from "@/lib/ano-letivo-session";
import { loginBranding } from "@/lib/login-config";
import { loginProfileOptions } from "@/lib/login-profiles";
import { cn } from "@/lib/utils";

type SgrmeLoginFormProps = {
  anosLetivos: AnoLetivoOption[];
  defaultAnoLetivoId: string;
};

export function SgrmeLoginForm({
  anosLetivos,
  defaultAnoLetivoId,
}: SgrmeLoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <p className="mb-5 text-center text-xs font-medium uppercase tracking-[0.28em] text-white sm:text-sm">
        {loginBranding.estado}
      </p>

      <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
        <div className="px-4 pb-6 pt-8 sm:px-8">
          <div className="text-center">
            <h1 className="text-sm font-bold uppercase leading-snug tracking-wide text-[#2F8FA8] sm:text-[15px]">
              {loginBranding.prefeitura}
            </h1>

            <div className="mx-auto mt-5 flex justify-center">
              <Image
                src={loginBranding.brasaoSrc}
                alt="Brasão de Jardim do Mulato"
                width={140}
                height={160}
                className="h-auto w-[140px] bg-white object-contain"
                priority
              />
            </div>

            <div className="mx-auto mt-5 h-px w-full bg-slate-200" />
          </div>

          <form action={handleSubmit} className="mt-6 space-y-5">
            <LoginField label="Perfil">
              <div className="relative">
                <UserRound
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2F8FA8]"
                  aria-hidden="true"
                />
                <select
                  id="perfil"
                  name="perfil"
                  required
                  defaultValue=""
                  className={fieldClassName("appearance-none pr-9")}
                >
                  <option value="" disabled>
                    Selecione o perfil
                  </option>
                  {loginProfileOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
              </div>
            </LoginField>

            <LoginField label="Usuário">              <div className="relative">
                <UserRound
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2F8FA8]"
                  aria-hidden="true"
                />
                <input
                  id="login"
                  name="login"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="CPF ou e-mail institucional"
                  className={fieldClassName()}
                />
              </div>
            </LoginField>

            <LoginField label="Senha">
              <div className="relative">
                <KeyRound
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2F8FA8]"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className={fieldClassName("pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </LoginField>

            {error ? (
              <p
                className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="ano_letivo_id"
                  className="text-sm font-medium text-slate-700"
                >
                  Ano Letivo:
                </label>
                <div className="relative">
                  <select
                    id="ano_letivo_id"
                    name="ano_letivo_id"
                    required
                    defaultValue={defaultAnoLetivoId}
                    className={cn(
                      "h-10 w-[92px] appearance-none rounded-md border border-slate-300 bg-white px-3 pr-8 text-sm text-slate-900 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4097B1]/40",
                    )}
                  >
                    {anosLetivos.map((ano) => (
                      <option key={ano.id} value={ano.id}>
                        {ano.ano}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 w-full min-w-[120px] items-center justify-center rounded-md bg-[#4097B1] px-6 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-[#36899f] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando
                  </>
                ) : (
                  "Entrar"
                )}
              </button>
            </div>
          </form>
        </div>

        <div
          className="relative h-16 bg-[repeating-linear-gradient(135deg,#f1f5f9,#f1f5f9_8px,#ffffff_8px,#ffffff_16px)]"
          aria-hidden="true"
        >
          <span className="absolute bottom-2 right-4 text-xs text-slate-400">
            {loginBranding.footer}
          </span>
        </div>
      </div>
    </div>
  );
}

function LoginField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function fieldClassName(extra?: string) {
  return cn(
    "h-10 w-full rounded-md border border-slate-300 bg-white pl-10 text-sm text-slate-900 shadow-inner placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4097B1]/40",
    extra,
  );
}
