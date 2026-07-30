import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { OutrasOpcoesNivelView } from "@/components/professor/outras-opcoes-nivel-view";
import { tituloNivelPlano } from "@/lib/professor-planos";

export default function OutrasOpcoesFundamentalPage() {
  const titulo = tituloNivelPlano("fundamental");

  return (
    <>
      <GestorPageHeader
        title={`Outras opções — ${titulo}`}
        description="Consultas e ferramentas complementares para planos do ensino fundamental"
      />
      <OutrasOpcoesNivelView nivel="fundamental" />
    </>
  );
}
