import Link from "next/link";
import { FileText, Plus, Sparkles } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function PlanosListPage() {
  const { profile } = await requireRole(["professor"]);
  const supabase = await createClient();

  const { data: planos } = await supabase
    .from("planos_aula")
    .select("id, tema, serie, disciplina, updated_at")
    .eq("professor_id", profile.id)
    .order("updated_at", { ascending: false });

  return (
    <>
      <GestorPageHeader
        title="Planos de Aula"
        description="Assistente pedagógico com IA alinhado à BNCC"
        actions={
          <Link href="/professor/planos/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Novo plano
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {planos?.map((plano) => (
          <Link key={plano.id} href={`/professor/planos/${plano.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>
              <CardTitle className="line-clamp-2">{plano.tema}</CardTitle>
              <CardDescription>
                {plano.serie}
                {plano.disciplina ? ` • ${plano.disciplina}` : ""}
              </CardDescription>
              <p className="mt-4 text-xs text-slate-500">
                Atualizado em{" "}
                {new Date(plano.updated_at).toLocaleDateString("pt-BR")}
              </p>
            </Card>
          </Link>
        )) ?? null}

        {(!planos || planos.length === 0) && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 h-5 w-5 text-violet-600" aria-hidden="true" />
              <div>
                <CardTitle>Nenhum plano criado</CardTitle>
                <CardDescription className="mt-2">
                  Gere seu primeiro plano de aula informando o tema e a série.
                  A IA elaborará objetivos, habilidades BNCC, metodologia e
                  avaliação — prontos para revisão e exportação em PDF.
                </CardDescription>
                <Link href="/professor/planos/novo" className="mt-4 inline-block">
                  <Button>Criar plano com IA</Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
