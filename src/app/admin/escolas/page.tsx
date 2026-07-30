import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EscolaForm } from "@/components/admin/escola-form";
import { EscolaListItem } from "@/components/admin/escola-list-item";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminEscolasPage() {
  const { profile } = await requireRole(["admin_sme"]);
  const supabase = await createClient();

  let escolasQuery = supabase
    .from("escolas")
    .select("id, nome, inep, endereco, ativa")
    .order("nome");

  if (profile.secretaria_id) {
    escolasQuery = escolasQuery.eq("secretaria_id", profile.secretaria_id);
  }

  const { data: escolas } = await escolasQuery;

  return (
    <DashboardShell
      profile={profile}
      title="Escolas da Rede"
      description="Cadastro e gestão das unidades escolares"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <EscolaForm />
        </div>

        <Card className="lg:col-span-2">
          <CardTitle>Escolas cadastradas</CardTitle>
          <CardDescription>
            {escolas?.length ?? 0} unidade(s) vinculada(s) à secretaria
          </CardDescription>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Nome</th>
                  <th className="px-3 py-2 font-medium">INEP</th>
                  <th className="px-3 py-2 font-medium">Endereço</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {escolas?.map((escola) => (
                  <EscolaListItem key={escola.id} escola={escola} />
                )) ?? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-slate-500">
                      Nenhuma escola cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
