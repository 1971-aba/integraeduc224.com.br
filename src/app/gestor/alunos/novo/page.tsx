import Link from "next/link";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { AlunoForm } from "@/components/secretaria/aluno-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function NovoAlunoPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();

  let turmasQuery = supabase
    .from("turmas")
    .select("id, nome, serie, turno")
    .order("nome");

  if (profile.role === "gestor_escolar" && profile.escola_id) {
    turmasQuery = turmasQuery.eq("escola_id", profile.escola_id);
  }

  const { data: turmas } = await turmasQuery;

  return (
    <>
      <GestorPageHeader
        title="Cadastrar Aluno"
        description="Matrícula completa conforme exigências da secretaria"
      />

      <Link
        href="/gestor/alunos"
        className="mb-4 inline-flex text-sm font-medium text-blue-700 hover:underline"
      >
        ← Voltar à lista
      </Link>

      <Card className="mx-auto max-w-xl">
        <CardTitle>Dados do estudante</CardTitle>
        <CardDescription>
          Nome, CPF, data de nascimento, nome da mãe e NIS (Lei de Acesso à
          Informação / programas sociais)
        </CardDescription>

        <div className="mt-6">
          <AlunoForm
            mode="create"
            turmas={(turmas ?? []).map((turma) => ({
              id: turma.id,
              label: `${turma.nome} — ${turma.serie} (${turma.turno})`,
            }))}
          />
        </div>
      </Card>
    </>
  );
}
