import { notFound, redirect } from "next/navigation";

const MODULOS_2024: Record<string, string> = {
  "ata-de-resultados": "ATA de Resultados",
  "ficha-de-avaliacoes": "Ficha de Avaliações",
  "boletins-individuais": "Boletins Individuais",
  "concludentes-2024": "Concludentes 2024",
  "retidos-2024": "Retidos 2024",
  "evasao-escolar-2024": "Evasão Escolar 2024",
  "formacoes-2024": "Formações 2024",
  "aluno-nota-10-2024": "Aluno Nota 10 2024",
  "complementares-2024": "Complementares 2024",
  "diario-de-classe-2024": "Diário de Classe 2024",
};

export default async function GestorSalaDeAulaAnosAnteriores2024ModuloPage({
  params,
}: {
  params: Promise<{ modulo: string }>;
}) {
  const { modulo } = await params;
  const label = MODULOS_2024[modulo];

  if (!label) {
    notFound();
  }

  redirect(
    `/gestor/em-breve?modulo=${encodeURIComponent(`Anos Anteriores 2024 — ${label}`)}`,
  );
}
