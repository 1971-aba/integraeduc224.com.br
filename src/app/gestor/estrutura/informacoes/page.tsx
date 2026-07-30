import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { EscolaInformacoesForm } from "@/components/gestor/escola-informacoes-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getContextoEscolaEstrutura } from "@/lib/gestor-estrutura-outros";

export default async function InformacoesEscolaPage() {
  const contexto = await getContextoEscolaEstrutura();

  if (!contexto) {
    return (
      <>
        <GestorPageHeader
          title="Informações da Escola"
          description="Dados institucionais da unidade escolar"
        />
        <SemEscolaAlert />
      </>
    );
  }

  return (
    <>
      <GestorPageHeader
        title="Informações da Escola"
        description={`${contexto.escola.nome} · ${contexto.municipio}`}
      />

      <Card>
        <CardTitle>Dados institucionais</CardTitle>
        <CardDescription>
          Contatos, gestão e horário de funcionamento
        </CardDescription>

        <div className="mt-6">
          <EscolaInformacoesForm
            escola={contexto.escola}
            informacoes={contexto.informacoes}
          />
        </div>
      </Card>
    </>
  );
}
