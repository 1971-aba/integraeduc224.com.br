import { GestorPercentualAtingidoPage } from "../gestor-percentual-page";

export default function GestorSalaDeAulaFrequenciaAnualPercentualMenorOuIgualPage({
  searchParams,
}: {
  searchParams: Promise<{
    tipo?: string;
    max?: string;
    min?: string;
    maxRange?: string;
  }>;
}) {
  return (
    <GestorPercentualAtingidoPage
      modoDestaque="lte"
      searchParams={searchParams}
    />
  );
}
