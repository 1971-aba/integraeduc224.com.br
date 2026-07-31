import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { RotasOnibusPanel } from "@/components/gestor/rotas-onibus-panel";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { getRotasOnibus } from "@/lib/gestor-estrutura-outros";

export default async function CadastroRotasPage() {
  const contexto = await getRotasOnibus();

  if (!contexto) {
    return (
      <>
        <GestorPageHeader
          title="Cadastro e Consultas"
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
        title="Cadastro e Consultas"
        description={`${contexto.rotas.length} rota(s) · ${contexto.escolaNome}`}
        actions={
          linhasCsv.length > 0 ? (
            <ExportarCsv
              rows={linhasCsv}
              filename="rotas-onibus.csv"
              label={`Exportar CSV (${linhasCsv.length})`}
            />
          ) : undefined
        }
      />

      <RotasOnibusPanel rotas={contexto.rotas} modo="cadastro" />
    </>
  );
}
