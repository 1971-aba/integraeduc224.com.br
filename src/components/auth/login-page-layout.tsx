import { loginBranding } from "@/lib/login-config";

type LoginPageLayoutProps = {
  children: React.ReactNode;
};

export function LoginPageLayout({ children }: LoginPageLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${loginBranding.backgroundSrc}')` }}
        aria-hidden="true"
      />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
