import { notFound, redirect } from "next/navigation";

const MODULOS_2023: Record<string, string> = {
  "ata-de-resultados": "ATA de Resultados",
  "ficha-de-avaliacoes": "Ficha de Avaliações",
  "boletins-individuais": "Boletins Individuais",
  "concludentes-2023": "Concludentes 2023",
  "retidos-2023": "Retidos 2023",
  "evasao-escolar-2023": "Evasão Escolar 2023",
  "formacoes-2023": "Formações 2023",
  "aluno-nota-10-2023": "Aluno Nota 10 2023",
  "complementares-2023": "Complementares 2023",
  "diario-de-classe-2023": "Diário de Classe 2023",
};

export default async function GestorSalaDeAulaAnosAnteriores2023ModuloPage({
  params,
}: {
  params: Promise<{ modulo: string }>;
}) {
  const { modulo } = await params;
  const label = MODULOS_2023[modulo];

  if (!label) {
    notFound();
  }

  redirect(
    `/gestor/em-breve?modulo=${encodeURIComponent(`Anos Anteriores 2023 — ${label}`)}`,
  );
}
