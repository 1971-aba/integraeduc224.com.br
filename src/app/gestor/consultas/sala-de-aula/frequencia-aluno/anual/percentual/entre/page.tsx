import { GestorPercentualAtingidoPage } from "../gestor-percentual-page";

export default function GestorSalaDeAulaFrequenciaAnualPercentualEntrePage({
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
      modoDestaque="between"
      searchParams={searchParams}
    />
  );
}
