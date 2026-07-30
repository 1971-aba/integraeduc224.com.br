import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { cn } from "@/lib/utils";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function SgaEmBrevePage({
  searchParams,
}: {
  searchParams: Promise<{ modulo?: string }>;
}) {
  const { modulo } = await searchParams;
  const titulo = modulo ?? "Módulo";

  return (
    <>
      <GestorPageHeader
        title={titulo}
        description="Este módulo ainda não está disponível no painel SGA."
      />

      <Card className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E3F2FD]">
          <Construction className="h-7 w-7 text-[#1E7BB8]" />
        </div>
        <CardTitle>Em breve</CardTitle>
        <CardDescription className="mt-2">
          A funcionalidade <strong>{titulo}</strong> será implementada em uma
          próxima versão.
        </CardDescription>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/sga"
            className={cn(
              "inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50",
            )}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao painel
          </Link>
        </div>
      </Card>
    </>
  );
}
