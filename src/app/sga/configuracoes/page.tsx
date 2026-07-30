import { getConfiguracaoRede } from "@/actions/sga-configuracoes";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { SgaConfiguracoesForm } from "@/components/sga/configuracoes-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { DEMO_SECRETARIA_ID } from "@/lib/dev-auth";

export default async function SgaConfiguracoesPage() {
  const { profile } = await requireRole(["tecnico_sga", "admin_sme"]);

  const secretariaId = profile.secretaria_id ?? DEMO_SECRETARIA_ID;
  const config = await getConfiguracaoRede(secretariaId);

  return (
    <>
      <GestorPageHeader
        title="Configurações do SGA"
        description="Política de senhas e permissões de gestão de acessos"
      />

      {config.updatedAt ? (
        <p className="mb-6 text-sm text-slate-500">
          Última atualização:{" "}
          {new Date(config.updatedAt).toLocaleString("pt-BR")}
        </p>
      ) : (
        <Card className="mb-6">
          <CardTitle>Configuração padrão</CardTitle>
          <CardDescription>
            Nenhuma personalização salva ainda. Os valores abaixo são os padrões
            da rede municipal.
          </CardDescription>
        </Card>
      )}

      <SgaConfiguracoesForm config={config} />
    </>
  );
}
