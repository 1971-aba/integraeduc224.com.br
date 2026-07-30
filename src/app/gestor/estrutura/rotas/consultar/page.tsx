import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { RotasOnibusPanel } from "@/components/gestor/rotas-onibus-panel";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { getRotasOnibus } from "@/lib/gestor-estrutura-outros";

export default async function ConsultarRotasPage() {
  const contexto = await getRotasOnibus();

  if (!contexto) {
    return (
      <>
        <GestorPageHeader
          title="Consultar Rotas"
          description="Rotas do transporte escolar"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const linhasCsv = contexto.rotas.map((rota) => ({
    Rota: rota.nome,
    Turno: rota.turno ?? "",
    Motorista: rota.motorista ?? "",
    Monitor: rota.monitor ?? "",
    Observacoes: rota.observacoes ?? "",
  }));

  return (
    <>
      <GestorPageHeader
        title="Consultar Rotas"
        description={`${contexto.rotas.length} rota(s) · ${contexto.escolaNome}`}
        actions={
          <ExportarCsv
            rows={linhasCsv}
            filename="rotas-onibus.csv"
            label={`Exportar CSV (${linhasCsv.length})`}
          />
        }
      />

      <Card className="mb-6">
        <CardTitle>Rotas cadastradas</CardTitle>
        <CardDescription>
          Consulta das rotas de transporte escolar desta unidade
        </CardDescription>
      </Card>

      <RotasOnibusPanel rotas={contexto.rotas} modo="consulta" />
    </>
  );
}
