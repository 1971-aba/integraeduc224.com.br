import { listServidoresEscola } from "@/actions/gestor-servidores";
import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { ServidorForm } from "@/components/gestor/servidor-form";
import { ServidorListItem } from "@/components/gestor/servidor-list-item";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { requireRole, isSgaManagementAvailable } from "@/lib/auth";
import { getRoleLabelSga } from "@/lib/sga-dashboard";
import { createClient } from "@/lib/supabase/server";
import { formatCpf } from "@/lib/utils";
import type { UserRole } from "@/types/database";

export default async function ServidoresEscolaPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    perfil?: UserRole;
    status?: "ativo" | "inativo";
  }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const managementAvailable = await isSgaManagementAvailable();

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader
          title="Servidores da Escola"
          description="Coordenadores e demais servidores com acesso à plataforma"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const supabase = await createClient();

  const [{ data: escola }, servidores] = await Promise.all([
    supabase
      .from("escolas")
      .select("nome")
      .eq("id", profile.escola_id)
      .maybeSingle(),
    listServidoresEscola(profile.escola_id, {
      q: params.q,
      perfil: params.perfil,
      status: params.status,
    }),
  ]);

  const linhasCsv = servidores.map((servidor) => ({
    Nome: servidor.nome,
    Email: servidor.email,
    CPF: servidor.cpf ? formatCpf(servidor.cpf) : "",
    Perfil: getRoleLabelSga(servidor.role),
    Status: servidor.ativo ? "Ativo" : "Inativo",
  }));

  return (
    <>
      <GestorPageHeader
        title="Servidores da Escola"
        description={`${servidores.length} servidor(es) · ${
          escola?.nome ?? "Unidade Escolar"
        }`}
        actions={
          <ExportarCsv
            rows={linhasCsv}
            filename="servidores-escola.csv"
            label={`Exportar CSV (${linhasCsv.length})`}
          />
        }
      />

      <form className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="q"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Buscar
          </label>
          <input
            id="q"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Nome, CPF ou e-mail"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="perfil"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Perfil
          </label>
          <select
            id="perfil"
            name="perfil"
            defaultValue={params.perfil ?? ""}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          >
            <option value="">Todos</option>
            <option value="coordenador">Coordenador</option>
            <option value="professor">Professor</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="status"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={params.status ?? ""}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          >
            <option value="">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399]"
        >
          Filtrar
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardTitle>Servidores cadastrados</CardTitle>
          <CardDescription>
            Coordenadores e professores vinculados a esta unidade
          </CardDescription>
          <ul className="mt-4 space-y-3">
            {servidores.map((servidor) => (
              <ServidorListItem key={servidor.id} servidor={servidor} />
            ))}
            {servidores.length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhum servidor cadastrado nesta escola.
              </li>
            ) : null}
          </ul>
        </Card>

        {managementAvailable ? (
          <ServidorForm />
        ) : (
          <Card>
            <CardTitle>Cadastro indisponível</CardTitle>
            <CardDescription>
              No modo demo, utilize os logins pré-configurados ou configure o
              Supabase Admin para criar novos usuários.
            </CardDescription>
          </Card>
        )}
      </div>
    </>
  );
}
