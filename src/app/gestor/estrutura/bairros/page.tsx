import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { LocalidadesPanel } from "@/components/gestor/localidades-panel";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import {
  TIPO_LOCALIDADE_LABEL,
  ZONA_LOCALIDADE_LABEL,
} from "@/lib/estrutura-outros-config";
import { getLocalidadesEscola } from "@/lib/gestor-estrutura-outros";

export default async function BairrosPovoadosPage() {
  const contexto = await getLocalidadesEscola();

  if (!contexto) {
    return (
      <>
        <GestorPageHeader
          title="Bairros e Povoados"
          description="Localidades atendidas pela escola"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const linhasCsv = contexto.localidades.map((item) => ({
    Nome: item.nome,
    Tipo: TIPO_LOCALIDADE_LABEL[item.tipo],
    Zona: ZONA_LOCALIDADE_LABEL[item.zona],
  }));

  return (
    <>
      <GestorPageHeader
        title="Bairros e Povoados"
        description={`${contexto.localidades.length} localidade(s) · ${contexto.escolaNome}`}
        actions={
          <ExportarCsv
            rows={linhasCsv}
            filename="bairros-povoados.csv"
            label={`Exportar CSV (${linhasCsv.length})`}
          />
        }
      />

      <Card className="mb-6">
        <CardTitle>Área de abrangência</CardTitle>
        <CardDescription>
          Bairros e povoados onde os alunos desta unidade residem ou são
          atendidos
        </CardDescription>
      </Card>

      <LocalidadesPanel localidades={contexto.localidades} />
    </>
  );
}
