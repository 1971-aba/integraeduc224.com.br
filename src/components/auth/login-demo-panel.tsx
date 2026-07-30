import { demoCredentials } from "@/lib/login-config";

type LoginDemoPanelProps = {
  databaseReady: boolean;
  devLoginEnabled: boolean;
};

export function LoginDemoPanel({
  databaseReady,
  devLoginEnabled,
}: LoginDemoPanelProps) {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="border-t border-slate-200 bg-[#f8f9fa] px-4 py-8">
      <div className="mx-auto w-full max-w-[420px] space-y-3">
        {!databaseReady ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Banco ainda não configurado</p>
            <p className="mt-1 leading-relaxed">
              {devLoginEnabled
                ? "Você pode entrar agora com as credenciais demo abaixo (modo desenvolvimento)."
                : "Adicione ENABLE_DEV_LOGIN=true no .env.local para testar sem Supabase."}
            </p>
          </div>
        ) : null}

        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
          <p className="mb-3 font-semibold text-slate-800">
            Credenciais demo para teste
          </p>
          <div className="space-y-3">
            {demoCredentials.map((cred) => (
              <div
                key={cred.perfil}
                className="rounded-md bg-slate-50 px-3 py-2 text-xs leading-relaxed"
              >
                <p className="font-medium text-slate-800">{cred.perfil}</p>
                <p>Perfil no login: {cred.perfilLogin}</p>
                <p>Usuário: {cred.usuario}</p>
                <p>Senha: {cred.senha}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
